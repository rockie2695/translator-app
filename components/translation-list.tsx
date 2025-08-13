"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface Translation {
  id: number;
  chinese: string;
  cantonese: string;
  created_at: string;
  updated_at: string;
}

interface TranslationListProps {
  className?: string;
}

export function TranslationList({ className }: TranslationListProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newChinese, setNewChinese] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  const [dbError, setDbError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const [addingTranslation, setAddingTranslation] = useState(false);
  const { toast } = useToast();

  const initializeDatabase = async () => {
    setInitializing(true);
    try {
      const response = await fetch("/api/init-db", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: data.message,
        });
        setDbError(null);
        fetchTranslations();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to initialize database",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize database",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const fetchTranslations = async (
    searchTerm: string = search,
    page: number = currentPage
  ) => {
    setLoading(true);
    setDbError(null);
    try {
      const response = await fetch(
        `/api/translations?search=${encodeURIComponent(
          searchTerm
        )}&page=${page}&limit=50`
      );
      const data = await response.json();

      if (response.ok) {
        setTranslations(data.translations);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        if (
          data.error &&
          data.error.includes('relation "translations" does not exist')
        ) {
          setDbError(
            "Database not initialized. Click the button below to set up the database."
          );
        } else {
          setDbError(data.error || "Failed to fetch translations");
        }
      }
    } catch (error) {
      const errorMessage = "Failed to connect to database";
      setDbError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranslations();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTranslations(search, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTranslations(search, page);
  };

  const handleAddTranslation = async () => {
    if (!newChinese.trim() || !newEnglish.trim()) {
      toast({
        title: "Error",
        description: "Both Chinese and Cantonese text are required",
        variant: "destructive",
      });
      return;
    }

    setAddingTranslation(true);
    try {
      const response = await fetch("/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chinese: newChinese.trim(),
          cantonese: newEnglish.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Translation added successfully",
        });
        setNewChinese("");
        setNewEnglish("");
        setIsAddDialogOpen(false);
        fetchTranslations();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to add translation",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add translation",
        variant: "destructive",
      });
    } finally {
      setAddingTranslation(false);
    }
  };

  if (dbError) {
    return (
      <div className={className}>
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-800">需要設定資料庫</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p>{dbError}</p>
                  <Button
                    onClick={initializeDatabase}
                    disabled={initializing}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {initializing ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        初始化資料庫...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2" />
                        初始化資料庫
                      </>
                    )}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="border-blue-200 bg-white/70 backdrop-blur-sm shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">翻譯列表</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新增翻譯組
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新增翻譯組</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="chinese">中文</Label>
                    <Textarea
                      id="chinese"
                      value={newChinese}
                      onChange={(e) => setNewChinese(e.target.value)}
                      placeholder="輸入中文..."
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cantonesepy">粵語拼音</Label>
                    <Textarea
                      id="cantonesepy"
                      value={newEnglish}
                      onChange={(e) => setNewEnglish(e.target.value)}
                      placeholder="輸入粵語拼音..."
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <Button
                    onClick={handleAddTranslation}
                    disabled={addingTranslation}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {addingTranslation ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        新增翻譯組...
                      </>
                    ) : (
                      "新增翻譯組"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
              <Input
                placeholder="搜尋中文或粵語拼音..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30"
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              搜尋
            </Button>
          </div>
          <div className="text-white/90 text-sm">總數: {total} 翻譯組</div>
        </CardHeader>
        <CardContent className="px-6 py-0">
          {loading ? (
            <div className="text-center py-12">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">載入翻譯組...</p>
            </div>
          ) : translations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>未找到翻譯組</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {translations.map((translation) => (
                  <div
                    key={translation.id}
                    className="flex items-center justify-between p-4 border border-blue-100 rounded-lg hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Badge
                          variant="outline"
                          className="mb-2 border-blue-300 text-blue-700"
                        >
                          中文
                        </Badge>
                        <p className="text-gray-800 font-medium">
                          {translation.chinese}
                        </p>
                      </div>
                      <div>
                        <Badge
                          variant="outline"
                          className="mb-2 border-red-300 text-red-700"
                        >
                          粵語拼音
                        </Badge>
                        <p className="text-gray-800">{translation.cantonese}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-600 px-4">
                    第 {currentPage} 頁，共 {totalPages} 頁
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
