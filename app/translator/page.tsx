import { Translator } from "@/components/translator";
import { PageHeader } from "@/components/page-header";

interface PageProps {
  searchParams: {
    search?: string;
  };
}

export default function TranslatorPage({ searchParams }: PageProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="智能翻譯機"
        description="使用我們的智慧型資料庫驅動系統翻譯中文和自製粵語拼音文本"
      />
      <Translator initialSearch={searchParams.search} />
    </div>
  );
}
