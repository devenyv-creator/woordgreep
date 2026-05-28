"use client";

import { useState } from "react";
import { puzzles } from "./data/puzzles";

export default function Home() {
const startDate = new Date("2026-01-01");
const today = new Date();

const diffTime = today.getTime() - startDate.getTime();
const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));

const puzzle = puzzles[dayIndex % puzzles.length];

const answer = puzzle.answer;

const hints = puzzle.hints;

const explanation = puzzle.explanation;

  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  function checkAnswer() {
    if (guess.trim().toLowerCase() === answer) {
      setMessage("Goed! 🎉");
      setIsSolved(true);
      setShowExplanation(true);
    } else {
      setMessage("Nog niet...");
    }
  }

  function showNextHint() {
    if (hintCount < hints.length) {
      setHintCount(hintCount + 1);
      setMessage("");
    }
  }

  function giveUp() {
    setMessage("Het antwoord is STAR.");
    setIsSolved(true);
    setShowExplanation(true);
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fffdf7",
      backgroundImage:
        "linear-gradient(#d7e8ff 1px, transparent 1px), linear-gradient(90deg, #ffd6dc 1px, transparent 1px)",
      backgroundSize: "100% 34px, 80px 100%",
      fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <section style={{
        width: "min(92vw, 560px)",
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}>
        <h1 style={{
          fontSize: "54px",
          marginBottom: "28px",
          color: "#6d28d9",
          fontWeight: 700,
          letterSpacing: "1px",
          textDecoration: "underline",
          textDecorationThickness: "4px",
          textUnderlineOffset: "10px",
        }}>
          Woordgreep
        </h1>

        <div style={{
          background: "#ffe66d",
          padding: "44px 34px",
          minHeight: "230px",
          boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
          transform: "rotate(-1deg)",
          marginBottom: "34px",
        }}>
          <p style={{
            color: "#2b2118",
            fontSize: "30px",
            lineHeight: 1.35,
            margin: "0 0 46px",
          }}>
            {puzzle.clue}
          </p>

          <div style={{
            fontSize: "34px",
            letterSpacing: "10px",
            color: "#2b2118",
          }}>
            {isSolved ? "S T A R" : "_ _ _ _"}
          </div>
        </div>

        <input
          value={guess}
          onChange={(event) => setGuess(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") checkAnswer();
          }}
          placeholder="Typ je antwoord..."
          disabled={isSolved}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "18px 22px",
            borderRadius: "14px",
            border: "2px solid #c4b5fd",
            fontSize: "22px",
            marginBottom: "16px",
            background: "rgba(255,255,255,0.92)",
            boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
            fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
          }}
        />

        <div style={{ minHeight: "34px", color: "#6d28d9", fontSize: "22px", marginBottom: "16px" }}>
          {message}
        </div>

        {hintCount > 0 && (
          <div style={{
            marginBottom: "18px",
            background: "rgba(255,255,255,0.92)",
            border: "2px solid #c4b5fd",
            borderRadius: "18px",
            padding: "16px",
            fontSize: "20px",
            color: "#2b2118",
          }}>
            {hints.slice(0, hintCount).map((hint) => (
              <div key={hint}>{hint}</div>
            ))}
          </div>
        )}

        <button onClick={checkAnswer} disabled={isSolved} style={{
          background: isSolved ? "#a78bfa" : "#6d28d9",
          color: "white",
          border: "none",
          padding: "16px 34px",
          borderRadius: "18px",
          fontSize: "24px",
          cursor: isSolved ? "default" : "pointer",
          boxShadow: "0 8px 0 #4c1d95",
          fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
          margin: "0 8px 14px",
        }}>
          Controleer
        </button>

        {!isSolved && hintCount < hints.length && (
          <button onClick={showNextHint} style={{
            background: "white",
            color: "#6d28d9",
            border: "2px solid #c4b5fd",
            padding: "14px 24px",
            borderRadius: "18px",
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 6px 0 #ddd6fe",
            fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
            margin: "0 8px 14px",
          }}>
            Hint
          </button>
        )}

        {!isSolved && hintCount === hints.length && (
          <button onClick={giveUp} style={{
            background: "white",
            color: "#6d28d9",
            border: "2px solid #c4b5fd",
            padding: "14px 24px",
            borderRadius: "18px",
            fontSize: "20px",
            cursor: "pointer",
            boxShadow: "0 6px 0 #ddd6fe",
            fontFamily: "Comic Sans MS, Chalkboard SE, cursive",
            margin: "0 8px 14px",
          }}>
            Geef op
          </button>
        )}

        {showExplanation && (
          <div style={{
            marginTop: "20px",
            background: "rgba(255,255,255,0.92)",
            border: "2px solid #c4b5fd",
            borderRadius: "18px",
            padding: "22px",
            color: "#2b2118",
            fontSize: "20px",
            lineHeight: 1.45,
          }}>
            {explanation}
          </div>
        )}

        <p style={{ color: "#6d28d9", marginTop: "28px", fontSize: "28px" }}>
          ♡
        </p>
      </section>
    </main>
  );
}