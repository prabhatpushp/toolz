import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Word } from "@/types/vocabulary"

// Interface for persisted state (only saved cards)
interface PersistedState {
    savedWords: Word[]
}

// Interface for the full store
interface VocabularyStore extends PersistedState {
    words: Word[]
    nextWords: Word[]
    currentIndex: number
    isLoading: boolean
    error: string | null
    setWords: (words: Word[]) => void
    setNextWords: (words: Word[]) => void
    setCurrentIndex: (index: number) => void
    setSavedWords: (words: Word[]) => void
    setIsLoading: (loading: boolean) => void
    setError: (error: string | null) => void
    addSavedWord: (word: Word) => boolean
    removeSavedWord: (word: Word) => void
}

// Create store with partial persistence
export const useVocabularyStore = create<VocabularyStore>()(
    persist(
        (set, get) => ({
            // Persisted state
            savedWords: [],

            // Non-persisted state
            words: [],
            nextWords: [],
            currentIndex: 0,
            isLoading: true,
            error: null,

            // Actions
            setWords: (words) => set({ words }),
            setNextWords: (words) => set({ nextWords: words }),
            setCurrentIndex: (index) => set({ currentIndex: index }),
            setSavedWords: (words) => set({ savedWords: words }),
            setIsLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error }),
            addSavedWord: (word) => {
                const { savedWords } = get()
                const isDuplicate = savedWords.some((savedWord) => savedWord.word === word.word)
                if (!isDuplicate) {
                    set((state) => ({
                        savedWords: [...state.savedWords, word],
                    }))
                    return true
                }
                return false
            },
            removeSavedWord: (word) =>
                set((state) => ({
                    savedWords: state.savedWords.filter((w) => w.word !== word.word),
                })),
        }),
        {
            name: "vocabulary-storage",
            // Only persist savedWords
            partialize: (state) => ({ savedWords: state.savedWords }),
            storage: createJSONStorage(() => localStorage),
        }
    )
) 