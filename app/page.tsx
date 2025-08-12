import { TranslationList } from "@/components/translation-list";
import { PageHeader } from "@/components/page-header";

export default function DictionaryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="翻譯列表"
        description="瀏覽並搜尋千個中文-粵語拼音翻譯組"
      />
      <TranslationList />
    </div>
  );
}
