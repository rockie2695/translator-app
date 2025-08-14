import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Translation {
  id: number;
  chinese: string;
  cantonese: string;
  created_at: string;
  updated_at: string;
}

export async function getTranslations(search = "", page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  try {
    if (search.trim()) {
      const searchPattern = `%${search}%`;
      const [translations, countResult] = await Promise.all([
        sql`
          SELECT id, chinese, cantonese, created_at, updated_at
          FROM translations
          WHERE chinese ILIKE ${searchPattern} OR cantonese ILIKE ${searchPattern}
          ORDER BY id
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`
          SELECT COUNT(*) as total 
          FROM translations
          WHERE chinese ILIKE ${searchPattern} OR cantonese ILIKE ${searchPattern}
        `,
      ]);

      return {
        translations: translations as Translation[],
        total: Number.parseInt((countResult[0] as any).total),
        totalPages: Math.ceil(
          Number.parseInt((countResult[0] as any).total) / limit
        ),
      };
    } else {
      const [translations, countResult] = await Promise.all([
        sql`
          SELECT id, chinese, cantonese, created_at, updated_at
          FROM translations
          ORDER BY id
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as total FROM translations`,
      ]);

      return {
        translations: translations as Translation[],
        total: Number.parseInt((countResult[0] as any).total),
        totalPages: Math.ceil(
          Number.parseInt((countResult[0] as any).total) / limit
        ),
      };
    }
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

// Enhanced translateText function to return multiple options for each word
export async function translateText(
  text: string,
  fromLang: "zh" | "en" = "zh"
) {
  // Split text into words for translation
  const words = text.split(/[\s，,、。！？.!?]/).filter((w) => w.trim());
  const results: Array<{
    original: string;
    translations: string[];
    selectedIndex: number;
  }> = [];

  for (const word of words) {
    if (!word.trim()) continue;

    try {
      let translations: string[] = [];

      if (fromLang === "zh") {
        // Get multiple English translations for Chinese word
        const result = await sql`
          SELECT cantonese 
          FROM translations 
          WHERE chinese = ${word.trim()} 
          LIMIT 5
        `;
        translations = result.map((r) => (r as any).cantonese);

        // If no exact match, try partial matches
        if (translations.length === 0) {
          const partialResult = await sql`
            SELECT cantonese 
            FROM translations 
            WHERE chinese ILIKE ${"%" + word.trim() + "%"} 
            LIMIT 3
          `;
          translations = partialResult.map((r) => (r as any).cantonese);
        }
      } else {
        // Get multiple Chinese translations for English word
        const result = await sql`
          SELECT chinese 
          FROM translations 
          WHERE cantonese ILIKE ${word.trim()} 
          LIMIT 5
        `;
        translations = result.map((r) => (r as any).chinese);

        // If no exact match, try partial matches
        if (translations.length === 0) {
          const partialResult = await sql`
            SELECT chinese 
            FROM translations 
            WHERE cantonese ILIKE ${"%" + word.trim() + "%"} 
            LIMIT 3
          `;
          translations = partialResult.map((r) => (r as any).chinese);
        }
      }

      // If still no translations found, use the original word
      if (translations.length === 0) {
        translations = [word];
      }

      // Remove duplicates
      const uniqueTranslations = [...new Set(translations)];

      results.push({
        original: word,
        translations: uniqueTranslations,
        selectedIndex: 0, // Default to first option
      });
    } catch (error) {
      console.error("Translation error for word:", word, error);
      results.push({
        original: word,
        translations: [word],
        selectedIndex: 0,
      });
    }
  }

  return results;
}

export async function addTranslation(chinese: string, cantonese: string) {
  try {
    const result = await sql`
      INSERT INTO translations (chinese, cantonese) 
      VALUES (${chinese}, ${cantonese}) 
      RETURNING *
    `;
    return result[0] as Translation;
  } catch (error) {
    console.error("Error adding translation:", error);
    throw error;
  }
}
