"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Copy, ChevronDown, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TranslatorProps {
  className?: string;
}

interface WordTranslation {
  original: string;
  translations: string[];
  selectedIndex: number;
}

export function Translator({ className }: TranslatorProps) {
  const [sourceText, setSourceText] = useState("");
  const [translationOptions, setTranslationOptions] = useState<
    WordTranslation[]
  >([]);
  const [fromLang, setFromLang] = useState<"zh" | "en">("zh");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          fromLang,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTranslationOptions(data.translationOptions);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to translate text",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate text",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLanguages = () => {
    // Get the currently selected translations as the new source text
    const selectedTranslations = translationOptions
      .map((option) => option.translations[option.selectedIndex])
      .join(" ");

    setFromLang(fromLang === "zh" ? "en" : "zh");
    setSourceText(selectedTranslations);
    setTranslationOptions([]);
  };

  const handleTranslationSelect = (
    wordIndex: number,
    translationIndex: number
  ) => {
    setTranslationOptions((prev) =>
      prev.map((word, index) =>
        index === wordIndex
          ? { ...word, selectedIndex: translationIndex }
          : word
      )
    );
  };

  const getSelectedTranslation = () => {
    return translationOptions
      .map((option) => option.translations[option.selectedIndex])
      .join(" ");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={className}>
      <Card className="border-blue-200 bg-white/70 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between text-xl">
            <span>智能翻譯機</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSwapLanguages}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              // disabled={translationOptions.length === 0}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              切換
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={fromLang === "zh" ? "default" : "default"}
                  className={fromLang === "zh" ? "bg-blue-600" : "bg-red-600"}
                >
                  {fromLang === "zh"
                    ? "中文 (Chinese)"
                    : "粵語拼音 (Cantonese)"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(sourceText)}
                  disabled={!sourceText.trim()}
                  className={
                    fromLang === "en"
                      ? "text-gray-600 hover:text-red-600"
                      : "text-gray-600 hover:text-blue-600"
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                placeholder={
                  fromLang === "zh"
                    ? "輸入中文文本進行翻譯..."
                    : "輸入粵語拼音進行翻譯..."
                }
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] resize-none border-blue-200 focus:border-blue-400"
              />
              <Button
                onClick={handleTranslate}
                disabled={loading || !sourceText.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    翻譯中...
                  </>
                ) : (
                  "翻譯"
                )}
              </Button>
            </div>

            {/* Translation Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant={fromLang === "en" ? "default" : "default"}
                  className={fromLang === "en" ? "bg-blue-600" : "bg-red-600"}
                >
                  {fromLang === "en"
                    ? "中文 (Chinese)"
                    : "粵語拼音 (Cantonese)"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(getSelectedTranslation())}
                  disabled={translationOptions.length === 0}
                  className={
                    fromLang === "en"
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-gray-600 hover:text-red-600"
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {/* <Textarea
                placeholder="翻譯將會顯示在此..."
                value={translatedText}
                readOnly
                className="min-h-[200px] resize-none bg-gray-50 border-purple-200"
              /> */}
              {/* Translation Display Area */}
              <div className="min-h-[200px] border border-purple-200 rounded-lg bg-gray-50 p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                  </div>
                ) : translationOptions.length > 0 ? (
                  <div className="space-y-3">
                    {/* Word-by-word translation options */}
                    <div className="flex flex-wrap gap-2">
                      {translationOptions.map((wordOption, index) => (
                        <div key={index} className="inline-block">
                          {wordOption.translations.length > 1 ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "h-8 px-3 text-sm border-blue-300 hover:bg-blue-50",
                                    "flex items-center gap-1"
                                  )}
                                >
                                  {
                                    wordOption.translations[
                                      wordOption.selectedIndex
                                    ]
                                  }
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-48"
                              >
                                {wordOption.translations.map(
                                  (translation, translationIndex) => (
                                    <DropdownMenuItem
                                      key={translationIndex}
                                      onClick={() =>
                                        handleTranslationSelect(
                                          index,
                                          translationIndex
                                        )
                                      }
                                      className="flex items-center justify-between cursor-pointer"
                                    >
                                      <span>{translation}</span>
                                      {wordOption.selectedIndex ===
                                        translationIndex && (
                                        <Check className="w-4 h-4 text-blue-600" />
                                      )}
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-3 text-sm border-gray-300 bg-gray-100 cursor-default"
                              disabled
                            >
                              {wordOption.translations[0]}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Final combined translation */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">
                        Final Translation:
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-blue-200 text-gray-800 font-medium min-h-[60px] flex items-center">
                        {getSelectedTranslation()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Translation will appear here...
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡
                點擊帶有下拉箭頭的單字即可查看其他翻譯。沒有箭頭的單字只有一種翻譯。翻譯是基於資料庫的條目，可能不完全準確。
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
