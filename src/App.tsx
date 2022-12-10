import React, { KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";
import { forEach, times, join, map, countBy, range, includes } from "lodash";
import { allWords, solutionWords } from "./words";
import { filterWords, getAverageScore, gray, green, suggestWord, yellow } from "./wordService";
import "./App.css";

interface LetterInputProps {
  colorValue: string;
  innerRef: React.RefObject<HTMLInputElement>;
  onColorChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onKeyUp?: React.KeyboardEventHandler<HTMLInputElement>;
}

const LetterInput: React.FC<LetterInputProps> = ({ colorValue, onColorChange, onFocus, onKeyUp, innerRef }) => {
  return (
    <div className="letter-input-container">
      <input ref={innerRef} className="letter-input" maxLength={1} onFocus={onFocus} onKeyUp={onKeyUp} />
      <input className="color-input" list="presets" onChange={onColorChange} type="color" value={colorValue} />
    </div>
  );
};

LetterInput.defaultProps = {
  onColorChange: undefined,
  onFocus: undefined,
  onKeyUp: undefined,
};

export const App = () => {
  const [round, setRound] = useState(1);
  const [possibleWords, setPossibleWords] = useState<string[]>(solutionWords);
  const suggestedWord = useMemo(() => {
    return suggestWord(possibleWords, round);
  }, [possibleWords, round]);
  const [notInWordList, setNotInWordList] = useState(false);

  const [totalScore, setTotalScore] = useState(0);
  const averageScore = totalScore / solutionWords.length;
  const [scores, setScores] = useState("");

  const [focusedInput, setFocusedInput] = useState(0);
  const [colors, setColors] = useState(
    times(5, () => {
      return gray;
    }),
  );
  const letterRef1 = useRef<HTMLInputElement>(null);
  const letterRef2 = useRef<HTMLInputElement>(null);
  const letterRef3 = useRef<HTMLInputElement>(null);
  const letterRef4 = useRef<HTMLInputElement>(null);
  const letterRef5 = useRef<HTMLInputElement>(null);
  const letterRefs = useMemo(() => {
    return [letterRef1, letterRef2, letterRef3, letterRef4, letterRef5];
  }, []);

  const setFocus = useCallback((id: number) => {
    return () => {
      setFocusedInput(id);
    };
  }, []);

  const clearInputs = useCallback(() => {
    setColors(
      times(5, () => {
        return gray;
      }),
    );
    forEach(letterRefs, (ref) => {
      if (ref.current) ref.current.value = "";
    });
    letterRef1.current?.focus();
    notInWordList && setNotInWordList(false);
  }, [letterRefs, notInWordList]);

  const reset = useCallback(() => {
    setPossibleWords(solutionWords);
    setRound(1);
    clearInputs();
  }, [clearInputs]);

  const setColorValue = useCallback(
    (index: number, value: string) => {
      const colorsCopy = [...colors];
      colorsCopy[index] = value;
      setColors(colorsCopy);
    },
    [colors],
  );

  const setColor = useCallback(
    (id: number) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        setColorValue(id, e.target.value);
      };
    },
    [setColorValue],
  );

  const onSubmit = useCallback(() => {
    const letters: string[] = [];
    forEach(letterRefs, (ref) => {
      ref.current && letters.push(ref.current.value.toLowerCase());
    });
    if (!includes(allWords, letters.join(""))) {
      setNotInWordList(true);
      return;
    }
    const newPossibleWords = filterWords(possibleWords, letters, colors);
    setPossibleWords(newPossibleWords);
    clearInputs();
    setRound(round + 1);
  }, [clearInputs, colors, letterRefs, possibleWords, round]);

  const testAll = useCallback(() => {
    const { localTotalScore, localScores } = getAverageScore();
    setTotalScore(localTotalScore);
    setScores(JSON.stringify(countBy(localScores)));
  }, []);

  const onKeyUp = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      notInWordList && setNotInWordList(false);
      if (e.key === "Enter" && focusedInput === 4) {
        onSubmit();
        return;
      }
      if (!e.code.startsWith("Key")) return;
      focusedInput !== 4 && letterRefs[focusedInput + 1].current?.focus();
    },
    [focusedInput, letterRefs, notInWordList, onSubmit],
  );

  return (
    <div className="app">
      <span>
        <p>
          Suggested Word:{" "}
          {suggestedWord.length
            ? join(
                map(suggestedWord, (word) => {
                  return word.toUpperCase();
                }),
                " or ",
              )
            : "None"}
        </p>
        <p>Round: {round}</p>
        <datalist id="presets">
          <option value={gray}>None</option>
          <option value={yellow}>Yellow</option>
          <option value={green}>Green</option>
        </datalist>
        <div className="all-letters-container">
          {map(range(5), (val) => {
            return (
              <LetterInput
                key={`letter-${val}`}
                colorValue={colors[val]}
                innerRef={letterRefs[val]}
                onColorChange={setColor(val)}
                onFocus={setFocus(val)}
                onKeyUp={onKeyUp}
              />
            );
          })}
        </div>
      </span>
      {notInWordList && <p>Not in word list!</p>}
      <div className="button-container">
        <button onClick={onSubmit} type="submit">
          Submit
        </button>
        <button onClick={reset} type="button">
          Reset
        </button>
        <button onClick={testAll} type="button">
          Test All
        </button>
      </div>
      {scores ? <p>Scores: {scores}</p> : <></>}
      {totalScore ? <p>Total Score: {totalScore}</p> : <></>}
      {averageScore ? <p>Average Score: {averageScore}</p> : <></>}
      <p>Possible Solutions: {possibleWords.length}</p>
      <div className="possible-words-container">
        <ul className="possible-words-list">
          {map(possibleWords, (possibleWord) => {
            return <li key={possibleWord}>{possibleWord}</li>;
          })}
        </ul>
      </div>
    </div>
  );
};

