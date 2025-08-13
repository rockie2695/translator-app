"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface TranslatorProps {
  className?: string;
}

export function Translator({ className }: TranslatorProps) {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
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
        setTranslatedText(data.translatedText);
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
    setFromLang(fromLang === "zh" ? "en" : "zh");
    setSourceText(translatedText);
    setTranslatedText(sourceText);
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

            {/* Translated Text */}
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
                  onClick={() => handleCopy(translatedText)}
                  disabled={!translatedText.trim()}
                  className={
                    fromLang === "en"
                      ? "text-gray-600 hover:text-blue-600"
                      : "text-gray-600 hover:text-red-600"
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                placeholder="翻譯將會顯示在此..."
                value={translatedText}
                readOnly
                className="min-h-[200px] resize-none bg-gray-50 border-purple-200"
              />
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 翻譯是基於資料庫的條目，可能不完全準確。
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
