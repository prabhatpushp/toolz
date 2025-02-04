"use client";

import { useState } from "react";
import type { SavedCardsProps } from "@/types/vocabulary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Volume2, GraduationCap, Bookmark, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export const SavedCards = ({ savedWords, onDelete }: SavedCardsProps) => {
    const [selectedWord, setSelectedWord] = useState<(typeof savedWords)[0] | null>(null);

    const handlePlayAudio = (e: React.MouseEvent, word: (typeof savedWords)[0]) => {
        e.stopPropagation(); // Prevent card click
        if (word.phonetics?.[0]?.audio) {
            const audio = new Audio(word.phonetics[0].audio);
            audio.play().catch(console.error);
        }
    };

    const handleDelete = (e: React.MouseEvent, word: (typeof savedWords)[0]) => {
        e.stopPropagation(); // Prevent card click
        onDelete(word);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">Saved Words</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    {savedWords.length} {savedWords.length === 1 ? "word" : "words"} saved
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedWords.map((word) => (
                    <Card
                        key={word.word}
                        className={cn("group relative overflow-hidden transition-all duration-300", "hover:shadow-lg hover:scale-[1.02] cursor-pointer", "active:scale-[0.98]")}
                        onClick={() => setSelectedWord(word)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold truncate">{word.word}</h3>
                                    <p className="text-sm text-muted-foreground truncate">{word.phonetic}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {word.phonetics?.[0]?.audio && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => handlePlayAudio(e, word)}
                                            aria-label="Play pronunciation"
                                        >
                                            <Volume2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDelete(e, word)}
                                        aria-label="Delete word"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-2 text-sm line-clamp-2">{word.meanings[0].definitions[0].definition}</p>
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-muted/50 to-transparent" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedWord} onOpenChange={() => setSelectedWord(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {selectedWord && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle className="text-2xl font-bold">{selectedWord.word}</DialogTitle>
                                    {selectedWord.phonetics?.[0]?.audio && (
                                        <Button variant="outline" size="sm" onClick={(e) => handlePlayAudio(e, selectedWord)} className="flex items-center gap-2">
                                            <Volume2 className="h-4 w-4" />
                                            Play Audio
                                        </Button>
                                    )}
                                </div>
                                <p className="text-lg text-muted-foreground mt-1">{selectedWord.phonetic}</p>
                            </DialogHeader>

                            <div className="mt-6 space-y-6">
                                {selectedWord.meanings.map((meaning, index) => (
                                    <div key={index} className="space-y-3">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-primary" />
                                            {meaning.partOfSpeech}
                                        </h3>
                                        <div className="space-y-4 pl-4">
                                            {meaning.definitions.map((def, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <p className="text-base">{def.definition}</p>
                                                    {def.example && <p className="text-sm text-muted-foreground italic">Example: "{def.example}"</p>}
                                                </div>
                                            ))}
                                            {(meaning.synonyms.length > 0 || meaning.antonyms.length > 0) && (
                                                <div className="pt-2 space-y-2 text-sm">
                                                    {meaning.synonyms.length > 0 && (
                                                        <p>
                                                            <span className="font-medium">Synonyms: </span>
                                                            {meaning.synonyms.join(", ")}
                                                        </p>
                                                    )}
                                                    {meaning.antonyms.length > 0 && (
                                                        <p>
                                                            <span className="font-medium">Antonyms: </span>
                                                            {meaning.antonyms.join(", ")}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
