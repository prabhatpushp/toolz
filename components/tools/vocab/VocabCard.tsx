"use client";

import { useEffect, useState } from "react";
import type { VocabCardProps } from "@/types/vocabulary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Bookmark, Volume2 } from "lucide-react";
import { toast } from "sonner";

export const VocabCard = ({ word, onNext, onPrev, onSave }: VocabCardProps) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                onPrev();
            } else if (event.key === "ArrowRight") {
                onNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onNext, onPrev]);

    const handlePlayAudio = () => {
        if (word.phonetics?.[0]?.audio) {
            const audio = new Audio(word.phonetics[0].audio);
            audio.play().catch(console.error);
        }
    };

    const handleSave = () => {
        const wasAdded = onSave(word);
        if (wasAdded) {
            toast.success("Word saved to your collection");
        } else {
            toast.error("This word is already in your collection");
        }
    };

    return (
        <Card className="mb-8 overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous word">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold">{word.word}</h2>
                    <Button variant="outline" size="icon" onClick={onNext} aria-label="Next word">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center justify-center mb-4">
                    <p className="text-gray-600 text-lg mr-2">{word.phonetic}</p>
                    {word.phonetics?.[0]?.audio && (
                        <Button variant="outline" size="sm" onClick={handlePlayAudio} aria-label="Play pronunciation">
                            <Volume2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="mb-6">
                    {word.meanings.map((meaning, index) => (
                        <div key={index} className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">{meaning.partOfSpeech}</h3>
                            <ol className="list-decimal pl-5 space-y-2">
                                {meaning.definitions.map((def, idx) => (
                                    <li key={idx}>
                                        <p>{def.definition}</p>
                                        {def.example && <p className="text-gray-600 mt-1 italic">Example: "{def.example}"</p>}
                                    </li>
                                ))}
                            </ol>
                            {meaning.synonyms.length > 0 && (
                                <p className="mt-2">
                                    <span className="font-semibold">Synonyms:</span> {meaning.synonyms.join(", ")}
                                </p>
                            )}
                            {meaning.antonyms.length > 0 && (
                                <p className="mt-2">
                                    <span className="font-semibold">Antonyms:</span> {meaning.antonyms.join(", ")}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <Button onClick={handleSave} className="w-full" aria-label="Save card">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Card
                </Button>
            </CardContent>
        </Card>
    );
};
