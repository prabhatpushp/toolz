import type { Word } from "@/types/vocabulary"

export class WordNotFoundError extends Error {
    constructor(word: string) {
        super(`Word "${word}" not found in dictionary`)
        this.name = "WordNotFoundError"
    }
}

export async function fetchRandomWords(): Promise<string[]> {
    try {
        const response = await fetch("https://random-word-api.herokuapp.com/word?number=10")
        if (!response.ok) {
            console.error("Failed to fetch random words")
            return []
        }
        return response.json()
    } catch (error) {
        console.error("Error fetching random words:", error)
        return []
    }
}

export async function fetchWordDetails(word: string): Promise<Word[] | null> {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Skipping word "${word}": not found in dictionary`)
                return null
            }
            console.error("Failed to fetch word details")
            return null
        }
        return response.json()
    } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            console.error("Network error. Please check your internet connection.")
        } else {
            console.error(`Error fetching details for ${word}:`, error)
        }
        return null
    }
}

export async function fetchValidWords(): Promise<Word[]> {
    const randomWords = await fetchRandomWords()
    const validWords: Word[] = []

    for (const word of randomWords) {
        const details = await fetchWordDetails(word)
        if (details && details[0] && details[0].meanings && details[0].meanings.length > 0) {
            validWords.push(details[0])
        }

        // If we have at least 3 valid words, we can return them
        if (validWords.length >= 3) {
            break
        }
    }

    return validWords
} 