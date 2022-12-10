import {
  forEach,
  includes,
  map,
  countBy,
  flatten,
  zipObject,
  max,
  pickBy,
  keys,
  filter,
  findIndex,
  range,
  min,
  values,
  zip,
  compact,
  every,
  first,
} from "lodash";
import * as download from "downloadjs";
import { allWords, solutionWords } from "./words";

export const green = "#6aaa64";
export const yellow = "#d1b036";
export const gray = "#cccccc";
const hardMode = false;

export const filterWords = (possibleWords: string[], letters: string[], colors: string[]) => {
  if (letters.length < 5) return possibleWords;
  const newPossibileWords = filter(possibleWords, (word) => {
    let condition = true;
    forEach(letters, (letter, i) => {
      const color = colors[i];
      const guessWithoutLetter = [...letters];
      guessWithoutLetter[i] = "_";
      const duplicateLetterIndex = findIndex(guessWithoutLetter, (l) => {
        return l === letter;
      });
      const guessLetterCount = filter(letters, (l) => {
        return l === letter;
      }).length;
      const wordLetterCount = filter([...word], (l) => {
        return l === letter;
      }).length;
      switch (color) {
        case green:
          condition = condition && word[i] === letter;
          return;
        case yellow:
          condition =
            condition &&
            word[i] !== letter &&
            includes(word, letter) &&
            (duplicateLetterIndex === -1 || colors[duplicateLetterIndex] === gray || wordLetterCount > 1);
          return;
        default:
          condition =
            condition &&
            (!includes(word, letter) ||
              wordLetterCount < guessLetterCount ||
              (duplicateLetterIndex !== -1 && colors[duplicateLetterIndex] !== gray && wordLetterCount === 1));
      }
    });
    return condition;
  });
  return newPossibileWords;
};

const getScores = (possibleWords: string[], commonLetters: string[], possibleBurnerWords?: string[]) => {
  const letterArrays: string[][] = [];
  forEach(range(5), (_, i) => {
    letterArrays.push(
      map(possibleWords, (word) => {
        return word[i];
      }),
    );
  });
  const letterCountsByPosition = map(letterArrays, (letterArray) => {
    return countBy(letterArray);
  });
  const totalLetterCounts = countBy(flatten(letterArrays));
  const scores = map(possibleBurnerWords?.length ? possibleBurnerWords : possibleWords, (word) => {
    let score = 0;
    forEach([...word], (letter, i) => {
      const letterScore = letterCountsByPosition[i][letter] || 0;
      const isDuplicateLetter =
        filter([...word], (l) => {
          return l === letter;
        }).length > 1;
      score +=
        isDuplicateLetter ||
        letter === commonLetters[i] ||
        (possibleBurnerWords?.length && includes(commonLetters, letter))
          ? 0
          : (totalLetterCounts[letter] - letterScore || 0) / 4;
      if (commonLetters[i] === ".") score += letterScore;
    });
    return score;
  });
  return zipObject(possibleBurnerWords?.length ? possibleBurnerWords : possibleWords, scores);
};

const getBestWords = (possibleWords: string[], commonLetters: string[], possibleBurnerWords?: string[]) => {
  const wordScores = getScores(possibleWords, commonLetters, possibleBurnerWords);
  const scores = values(wordScores);
  const maxScore = max(scores) || 0;
  const minScore = min(scores) || 0;
  const bestWords = pickBy(wordScores, (score) => {
    return score === maxScore;
  });
  return { bestWords, maxScore, minScore };
};

export const suggestWord = (words: string[], round: number) => {
  const numRoundsLeft = 6 - round;
  const letterArrs = map(words, (pw) => {
    return [...pw];
  });
  const commonLetters = compact(
    flatten(
      map(zip(...letterArrs), (letterPositionArr) => {
        return every(letterPositionArr, (letter) => {
          return letter === letterPositionArr[0];
        })
          ? letterPositionArr[0]
          : ".";
      }),
    ),
  );
  const shouldUseBurnerWord =
    filter(commonLetters, (letter) => {
      return letter !== ".";
    }).length >= 2 &&
    numRoundsLeft < words.length &&
    round < 6 &&
    words.length > 2;
  const { bestWords, maxScore } = getBestWords(
    words,
    commonLetters,
    shouldUseBurnerWord && !hardMode ? allWords : undefined,
  );
  return maxScore || keys(bestWords).length === 1
    ? keys(bestWords)
    : shouldUseBurnerWord
    ? keys(getBestWords(words, commonLetters).bestWords)
    : [];
};

const getColors = (solution: string, guess: string) => {
  const colorsArr: string[] = [];
  forEach([...guess], (letter, i) => {
    const guessWithoutLetterArr = [...guess];
    guessWithoutLetterArr[i] = "_";
    const duplicateLetterIndex = findIndex(guessWithoutLetterArr, (l) => {
      return l === letter;
    });
    const solutionLetterCount = filter([...solution], (solutionLetter) => {
      return solutionLetter === letter;
    }).length;
    if (letter === solution[i]) colorsArr.push(green);
    else if (
      solution.includes(letter) &&
      (duplicateLetterIndex === -1 ||
        (solutionLetterCount === 1 &&
          solution[duplicateLetterIndex] !== guess[duplicateLetterIndex] &&
          i < duplicateLetterIndex) ||
        solutionLetterCount > 1)
    )
      colorsArr.push(yellow);
    else colorsArr.push(gray);
  });
  return colorsArr;
};

export const getAverageScore = () => {
  const localScores: number[] = [];
  let localTotalScore = 0;
  let output = "";
  forEach(solutionWords, (word) => {
    let numGuesses = 1;
    let sugWord = first(suggestWord(solutionWords, numGuesses)) || "";
    output += sugWord;
    let posWords = [...solutionWords];
    while (sugWord !== word) {
      const newColors = getColors(word, sugWord);
      posWords = filterWords(posWords, sugWord.split(""), newColors);
      numGuesses += 1;
      sugWord = first(suggestWord(posWords, numGuesses)) || "";
      output += `,${sugWord}`;
      if (sugWord === "") {
        console.error(`No solution found for ${word}`);
        break;
      }
    }
    localScores.push(numGuesses);
    localTotalScore += numGuesses;
    output += "\n";
  });
  download(output, "results.txt");
  return { localScores, localTotalScore };
};
