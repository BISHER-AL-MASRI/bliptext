export const WORD_MATCH_REGEX = /\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\)|[^\s]+/g;

export function isValidWord(newWord: string): boolean {
    if (newWord.length > 100) return false;

    const isBoldOrItalic = (
        /^\*\*[\s\w\d\p{P}]+\*\*$/u.test(newWord) ||
        /^\*[\s\w\d\p{P}]+\*$/u.test(newWord)
    );

    const isLink = /^\[[\w\s\d\p{P}]+\]\([^\s]{1,100}\)$/u.test(newWord);
    const isPlainWord = /^(?!.*?_)[\w]+[.,]?$/.test(newWord);

    return isBoldOrItalic || isLink || isPlainWord;
}
