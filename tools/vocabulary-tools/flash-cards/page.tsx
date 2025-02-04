"use client";

import { useEffect } from "react";
import { VocabCard } from "@/components/tools/vocab/VocabCard";
import { SavedCards } from "@/components/tools/vocab/SavedCards";
import { useVocabularyStore } from "@/store/vocabularyStore";
import { fetchValidWords } from "@/lib/vocabulary";
import { Button } from "@/components/ui/button";
import { RefreshCw, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function FlashCardsPage() {
    const { words, currentIndex, savedWords, isLoading, setWords, setCurrentIndex, addSavedWord, removeSavedWord, setIsLoading } = useVocabularyStore();

    useEffect(() => {
        loadWords();
    }, []);

    const loadWords = async () => {
        setIsLoading(true);
        const newWords = await fetchValidWords();

        if (newWords.length > 0) {
            setWords([...words, ...newWords]);
        } else {
            // If no words were found, try again
            await loadWords();
        }
        setIsLoading(false);
    };

    const handleRetry = () => {
        loadWords();
    };

    const handleNext = async () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setIsLoading(true);
            await loadWords();
            setIsLoading(false);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const LoadingCard = () => (
        <Card className="mb-8 overflow-hidden shadow-md">
            <CardContent className="p-6 relative">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="icon" disabled>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <div className="h-8 w-32 bg-muted/30 animate-pulse rounded-md"></div>
                    <Button variant="outline" size="icon" disabled>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>

                {/* Main Content */}
                <div className="min-h-[300px] flex flex-col items-center justify-center relative">
                    {/* Background Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                        <BookOpen className="w-64 h-64" strokeWidth={1} />
                    </div>

                    {/* Loading Content */}
                    <div className="relative flex flex-col items-center space-y-6 py-8">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-sm bg-primary/20"></div>
                            <div className="relative animate-spin rounded-full h-12 w-12 border-[3px] border-primary/30 border-l-primary"></div>
                        </div>
                        <div className="space-y-2 text-center max-w-sm">
                            <h3 className="text-lg font-medium text-foreground">Loading New Words</h3>
                            <p className="text-sm text-muted-foreground">Discovering interesting vocabulary for you...</p>
                        </div>
                    </div>
                </div>

                {/* Footer - Mimicking Save Button */}
                <div className="mt-6">
                    <div className="h-10 bg-muted/30 animate-pulse rounded-md w-full"></div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">Vocabulary Flashcards</h1>
                    <p className="text-muted-foreground">Expand your vocabulary one word at a time</p>
                </div>

                {isLoading || words.length === 0 ? <LoadingCard /> : <VocabCard word={words[currentIndex]} onNext={handleNext} onPrev={handlePrev} onSave={addSavedWord} />}

                <SavedCards savedWords={savedWords} onDelete={removeSavedWord} />
            </div>
        </div>
    );
}
