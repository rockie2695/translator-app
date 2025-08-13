import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Translation {
  id: number
  chinese: string
  cantonese: string
  created_at: string
  updated_at: string
}

export async function getTranslations(search = "", page = 1, limit = 50) {
  const offset = (page - 1) * limit

  try {
    if (search.trim()) {
      const searchPattern = `%${search}%`
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
      ])

      return {
        translations: translations as Translation[],
        total: Number.parseInt((countResult[0] as any).total),
        totalPages: Math.ceil(Number.parseInt((countResult[0] as any).total) / limit),
      }
    } else {
      const [translations, countResult] = await Promise.all([
        sql`
          SELECT id, chinese, cantonese, created_at, updated_at
          FROM translations
          ORDER BY id
          LIMIT ${limit} OFFSET ${offset}
        `,
        sql`SELECT COUNT(*) as total FROM translations`,
      ])

      return {
        translations: translations as Translation[],
        total: Number.parseInt((countResult[0] as any).total),
        totalPages: Math.ceil(Number.parseInt((countResult[0] as any).total) / limit),
      }
    }
  } catch (error) {
    console.error("Database error:", error)
    throw error
  }
}

export async function translateText(text: string, fromLang: "zh" | "en" = "zh") {
  // Split text into sentences and words for translation
  const sentences = text.split(/[。！？.!?]/).filter((s) => s.trim())
  const results: string[] = []

  for (const sentence of sentences) {
    if (!sentence.trim()) continue

    // Try to find exact matches first
    const words = sentence.split(/[\s，,、]/).filter((w) => w.trim())
    const translatedWords: string[] = []

    for (const word of words) {
      if (!word.trim()) continue

      try {
        let translation
        if (fromLang === "zh") {
          const result = await sql`
            SELECT cantonese 
            FROM translations 
            WHERE chinese = ${word.trim()} 
            LIMIT 1
          `
          translation = result[0] ? (result[0] as any).cantonese : word
        } else {
          const result = await sql`
            SELECT chinese 
            FROM translations 
            WHERE cantonese ILIKE ${word.trim()} 
            LIMIT 1
          `
          translation = result[0] ? (result[0] as any).chinese : word
        }

        translatedWords.push(translation)
      } catch (error) {
        console.error("Translation error for word:", word, error)
        translatedWords.push(word) // Fallback to original word
      }
    }

    if (translatedWords.length > 0) {
      results.push(translatedWords.join(" "))
    }
  }

  return results.join(". ")
}

export async function addTranslation(chinese: string, cantonese: string) {
  try {
    const result = await sql`
      INSERT INTO translations (chinese, cantonese) 
      VALUES (${chinese}, ${cantonese}) 
      RETURNING *
    `
    return result[0] as Translation
  } catch (error) {
    console.error("Error adding translation:", error)
    throw error
  }
}
