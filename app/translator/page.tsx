import { Translator } from "@/components/translator"
import { PageHeader } from "@/components/page-header"

export default function TranslatorPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Smart Translator"
        description="Translate Chinese and English text using our intelligent database-driven system"
      />
      <Translator />
    </div>
  )
}
