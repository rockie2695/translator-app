import { TranslationList } from "@/components/translation-list";
import { PageHeader } from "@/components/page-header";

export default function DictionaryPage({ searchParams }: { searchParams: { search?: string } }) {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="翻譯列表"
        description="瀏覽並搜尋千個中文-自製粵語拼音翻譯組 https://docs.google.com/spreadsheets/d/1wNvn3RhgBLE7NsUyyIBd1OP3BzmF1TtT9vfL8XzZgI0/edit?usp=sharing"
      />
      <TranslationList initialsearch={searchParams.search} />
    </div>
  );
}
