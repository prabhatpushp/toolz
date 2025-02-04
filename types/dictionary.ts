export interface WordDefinition {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
    sourceUrl?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
    synonyms?: string[];
    antonyms?: string[];
  }[];
}

export interface WordData {
  data: WordDefinition;
  index: number;
}