export interface Word {
    word: string
    phonetic: string
    phonetics: {
        text: string
        audio: string
    }[]
    meanings: {
        partOfSpeech: string
        definitions: {
            definition: string
            example?: string
        }[]
        synonyms: string[]
        antonyms: string[]
    }[]
}

export interface VocabCardProps {
    word: Word
    onNext: () => void
    onPrev: () => void
    onSave: (word: Word) => boolean
}

export interface SavedCardsProps {
    savedWords: Word[]
    onDelete: (word: Word) => void
} 