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
  uniq,
  zip,
  compact,
  every,
  first,
} from "lodash";
import { allWords, solutionWords } from "./words";

export const green = "#6aaa64";
export const yellow = "#d1b036";
export const gray = "#cccccc";

export const filterWords = (possibleWords: string[], letters: string[], colors: string[]) => {
  if (letters.length < 5) return possibleWords;
  const newPossibileWords = filter(possibleWords, (word) => {
    let condition = true;
    forEach(letters, (letter, i) => {
      const color = colors[i];
      const wordWithoutLetter = [...letters];
      wordWithoutLetter[i] = "_";
      const duplicateLetterIndex = findIndex(wordWithoutLetter, (l) => {
        return l === letter;
      });
      switch (color) {
        case green:
          condition = condition && word[i] === letter;
          return;
        case yellow:
          condition = condition && word[i] !== letter && includes(word, letter);
          return;
        default:
          condition =
            condition &&
            (!includes(word, letter) ||
              (duplicateLetterIndex !== -1 &&
                (colors[duplicateLetterIndex] === green || colors[duplicateLetterIndex] === yellow) &&
                filter([...word], (l) => {
                  return l === letter;
                }).length === 1));
      }
    });
    return condition;
  });
  return newPossibileWords;
};

const getScores = (possibleWords: string[], possibleBurnerWords?: string[], commonLetters?: string[]) => {
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
      const notDuplicateLetter =
        filter([...word], (l) => {
          return l === letter;
        }).length === 1;
      score +=
        possibleBurnerWords?.length && includes(commonLetters, letter)
          ? 0
          : letterScore + ((notDuplicateLetter && totalLetterCounts[letter] - letterScore) || 0) / 4;
    });
    return score;
  });
  return zipObject(possibleBurnerWords?.length ? possibleBurnerWords : possibleWords, scores);
};

const getBestWords = (possibleWords: string[], possibleBurnerWords?: string[], commonLetters?: string[]) => {
  const wordScores = getScores(possibleWords, possibleBurnerWords, commonLetters);
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
  const allLetters = flatten(letterArrs);
  const commonLetters = compact(
    uniq(
      flatten(
        filter(zip(...letterArrs), (letterPositionArr) => {
          return every(letterPositionArr, (letter) => {
            return letter === letterPositionArr[0];
          });
        }),
      ),
    ),
  );
  const uniqLetters = filter(uniq(allLetters), (letter) => {
    return !includes(commonLetters, letter);
  });
  const shouldUseBurnerWord =
    commonLetters.length >= 2 &&
    uniqLetters.length > 2 &&
    numRoundsLeft < words.length &&
    round < 6 &&
    words.length > 2;
  const { bestWords, maxScore } = getBestWords(words, shouldUseBurnerWord ? allWords : undefined, commonLetters);
  return maxScore ? keys(bestWords) : shouldUseBurnerWord ? keys(getBestWords(words).bestWords) : [];
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
  forEach(solutionWords, (word) => {
    let numGuesses = 1;
    let sugWord = first(suggestWord(solutionWords, numGuesses)) || "";
    let posWords = [...solutionWords];
    let allWordsF = [...allWords];
    while (sugWord !== word) {
      const newColors = getColors(word, sugWord);
      posWords = filterWords(posWords, sugWord.split(""), newColors);
      allWordsF = filterWords(allWordsF, sugWord.split(""), newColors);
      numGuesses += 1;
      sugWord = first(suggestWord(posWords, numGuesses)) || "";
      if (sugWord === "") {
        console.error(`No solution found for ${word}`);
        break;
      }
    }
    if (numGuesses >= 6) {
      console.log(word);
    }
    localScores.push(numGuesses);
    localTotalScore += numGuesses;
  });
  return { localScores, localTotalScore };
};
