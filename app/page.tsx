import { TranslationList } from "@/components/translation-list"
import { PageHeader } from "@/components/page-header"

export default function DictionaryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Translation Dictionary"
        description="Browse and search through thousands of Chinese-English translation pairs"
      />
      <TranslationList />
    </div>
  )
}
