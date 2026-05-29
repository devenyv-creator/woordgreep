"use client";

import { useEffect, useState } from "react";
import { puzzles } from "./data/puzzles";

type SavedGame = {
  dateKey: string;
  isSolved: boolean;
  guess: string;
  hintCount: number;
  showExplanation: boolean;
};

type StreakData = {
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string | null;
};

function getDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function getYesterdayDateKey(date: Date) {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
}

export default function Home() {
  const startDate = new Date("2026-01-01");
  const today = new Date();

  const todayKey = getDateKey(today);
  const yesterdayKey = getYesterdayDateKey(today);

  const diffTime = today.getTime() - startDate.getTime();
  const dayIndex = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const puzzle = puzzles[dayIndex % puzzles.length];

  const answer = puzzle.answer.toLowerCase();
  const hints = puzzle.hints;
  const explanation = puzzle.explanation;

  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [hintCount, setHintCount] = useState(0);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const savedGameText = localStorage.getItem("woordgreep-game");
    const savedStreakText = localStorage.getItem("woordgreep-streak");

    if (savedGameText) {
      const savedGame: SavedGame = JSON.parse(savedGameText);

      if (savedGame.dateKey === todayKey) {
        setGuess(savedGame.guess);
        setIsSolved(savedGame.isSolved);
        setHintCount(savedGame.hintCount);
        setShowExplanation(savedGame.showExplanation);
      }
    }

    if (savedStreakText) {
      const savedStreak: StreakData = JSON.parse(savedStreakText);
      setCurrentStreak(savedStreak.currentStreak);
      setBestStreak(savedStreak.bestStreak);
    }
  }, [todayKey]);

  function saveGame(newGame: SavedGame) {
    localStorage.setItem("woordgreep-game", JSON.stringify(newGame));
  }

  function updateStreakAfterSolve() {
    const savedStreakText = localStorage.getItem("woordgreep-streak");

    let streakData: StreakData = {
      currentStreak: 0,
      bestStreak: 0,
      lastSolvedDate: null,
    };

    if (savedStreakText) {
      streakData = JSON.parse(savedStreakText);
    }

    if (streakData.lastSolvedDate === todayKey) return;

    let newCurrentStreak = 1;

    if (streakData.lastSolvedDate === yesterdayKey) {
      newCurrentStreak = streakData.currentStreak + 1;
    }

    const newBestStreak = Math.max(streakData.bestStreak, newCurrentStreak);

    const newStreakData: StreakData = {
      currentStreak: newCurrentStreak,
      bestStreak: newBestStreak,
      lastSolvedDate: todayKey,
    };

    localStorage.setItem("woordgreep-streak", JSON.stringify(newStreakData));

    setCurrentStreak(newCurrentStreak);
    setBestStreak(newBestStreak);
  }

  function checkAnswer() {
    if (guess.trim().toLowerCase() === answer) {
      setMessage("Goed! 🎉");
      setIsSolved(true);
      setShowExplanation(true);

      saveGame({
        dateKey: todayKey,
        isSolved: true,
        guess,
        hintCount,
        showExplanation: true,
      });

      updateStreakAfterSolve();
    } else {
      setMessage("Nog niet...");
    }
  }

  function showNextHint() {
    const newHintCount = hintCount + 1;

    if (hintCount < hints.length) {
      setHintCount(newHintCount);
      setMessage("");

      saveGame({
        dateKey: todayKey,
        isSolved,
        guess,
        hintCount: newHintCount,
        showExplanation,
      });
    }
  }

  function giveUp() {
    setMessage(`Het antwoord is ${puzzle.answer.toUpperCase()}.`);
    setIsSolved(true);
    setShowExplanation(true);

    saveGame({
      dateKey: todayKey,
      isSolved: true,
      guess,
      hintCount,
      showExplanation: true,
    });
  }

  async function shareResult(platform: "TikTok" | "Instagram") {
    const shareText = `Ik speelde Woordgreep vandaag 🔥
Streak ${currentStreak}
Beste streak ${bestStreak}

Speel mee op woordgreep.nl`;

    if (navigator.share) {
      await navigator.share({
        title: "Woordgreep",
        text: shareText,
        url: "https://woordgreep.nl",
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      setMessage(`Tekst gekopieerd voor ${platform}!`);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#fffdf7",
        backgroundImage:
          "linear-gradient(#d7e8ff 1px, transparent 1px), linear-gradient(90deg, #ffd6dc 1px, transparent 1px)",
        backgroundSize: "100% 34px, 80px 100%",
        fontFamily: "var(--font-alegreya), serif",
        padding: "16px",
        overflow: "hidden",
      }}
    >
      <section
        style={{
          width: "min(94vw, 680px)",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(42px, 9vw, 74px)",
            margin: "0 0 6px",
            color: "#6d28d9",
            fontWeight: 800,
            lineHeight: 0.95,
            textDecoration: "underline",
            textDecorationThickness: "4px",
            textUnderlineOffset: "8px",
          }}
        >
          Woordgreep
        </h1>

        <div
          style={{
            color: "#6d28d9",
            fontSize: "24px",
            marginBottom: "14px",
            fontWeight: 800,
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span>🔥 {currentStreak}</span>
          <span>👑 {bestStreak}</span>
        </div>

        <div
  style={{
    background: "rgba(255,255,255,0.82)",
    border: "2px solid #ddd6fe",
    borderRadius: "18px",
    padding: "12px 16px",
    marginBottom: "20px",
    boxShadow: "0 8px 18px rgba(76, 29, 149, 0.08)",
  }}
>
  <p
    style={{
      margin: "0 0 6px",
      color: "#6d28d9",
      fontSize: "20px",
      fontWeight: 700,
    }}
  >
    📲 Voeg Woordgreep toe aan je beginscherm
  </p>

  <p
    style={{
      margin: 0,
      color: "#2b2118",
      fontSize: "15px",
      lineHeight: 1.4,
    }}
  >
    Open in Safari of Chrome en kies
    <strong> “Zet op beginscherm”</strong>.
  </p>
</div>

        <div
          style={{
            background: "linear-gradient(135deg, #fff176, #ffe45c)",
            padding: "34px 28px",
            minHeight: "180px",
            boxShadow: "0 16px 30px rgba(76, 29, 149, 0.18)",
            transform: "rotate(-1deg)",
            marginBottom: "24px",
            position: "relative",
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "-18px",
              background: "#c4b5fd",
              width: "86px",
              height: "30px",
              transform: "rotate(-18deg)",
              opacity: 0.85,
            }}
          />

          <p
            style={{
              color: "#2b2118",
              fontSize: "clamp(24px, 5vw, 34px)",
              lineHeight: 1.2,
              margin: "0 0 34px",
              fontWeight: 700,
            }}
          >
            {puzzle.clue}
          </p>

          <div
            style={{
              fontSize: "34px",
              letterSpacing: "11px",
              color: "#2b2118",
              fontWeight: 800,
            }}
          >
            {isSolved
              ? puzzle.answer.toUpperCase().split("").join(" ")
              : puzzle.answer
                  .split("")
                  .map(() => "_")
                  .join(" ")}
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
            padding: "14px 18px",
            borderRadius: "14px",
            border: "2px solid #8b5cf6",
            fontSize: "21px",
            marginBottom: "10px",
            background: "rgba(255,255,255,0.96)",
            fontFamily: "var(--font-alegreya), serif",
          }}
        />

        <div
          style={{
            minHeight: "28px",
            color: "#6d28d9",
            fontSize: "22px",
            marginBottom: "12px",
            fontWeight: 700,
          }}
        >
          {message}
        </div>

        <div>
          <button onClick={checkAnswer} disabled={isSolved} style={primaryButton}>
            Controleer
          </button>

          {!isSolved && hintCount < hints.length && (
            <button onClick={showNextHint} style={secondaryButton}>
              💡 Hint
            </button>
          )}

          {!isSolved && hintCount === hints.length && (
            <button onClick={giveUp} style={secondaryButton}>
              🚩 Geef op
            </button>
          )}
        </div>

        {hintCount > 0 && (
          <div style={infoBox}>
            {hints.slice(0, hintCount).map((hint) => (
              <div key={hint}>{hint}</div>
            ))}
          </div>
        )}

        {showExplanation ? (
          <div style={infoBox}>{explanation}</div>
        ) : (
          <div style={infoBox}>🔒 Los de puzzel op om de uitleg te zien.</div>
        )}

        {isSolved && (
          <div
            style={{
              marginTop: "16px",
              background: "rgba(255,255,255,0.92)",
              border: "1px solid #ddd6fe",
              borderRadius: "22px",
              padding: "18px",
              boxShadow: "0 8px 18px rgba(76, 29, 149, 0.08)",
            }}
          >
            <h2
              style={{
                color: "#6d28d9",
                fontSize: "26px",
                margin: "0 0 6px",
                textDecoration: "underline",
                textUnderlineOffset: "6px",
              }}
            >
              Share jouw resultaat
            </h2>

            <p
              style={{
                color: "#3b235f",
                fontSize: "17px",
                margin: "0 0 14px",
              }}
            >
              Laat je vrienden zien dat je de Woordgreep van vandaag hebt opgelost!
            </p>

            <button onClick={() => shareResult("Instagram")} style={shareButton}>
            ↗ Deel resultaat
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

const primaryButton = {
  background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
  color: "white",
  border: "none",
  padding: "14px 28px",
  borderRadius: "16px",
  fontSize: "21px",
  cursor: "pointer",
  boxShadow: "0 6px 0 #4c1d95",
  fontFamily: "var(--font-alegreya), serif",
  margin: "0 6px 12px",
  fontWeight: 800,
};

const secondaryButton = {
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  border: "2px solid #8b5cf6",
  padding: "12px 22px",
  borderRadius: "16px",
  fontSize: "20px",
  cursor: "pointer",
  boxShadow: "0 5px 0 #ddd6fe",
  fontFamily: "var(--font-alegreya), serif",
  margin: "0 6px 12px",
  fontWeight: 800,
};

const infoBox = {
  marginTop: "14px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid #ddd6fe",
  borderRadius: "18px",
  padding: "14px 18px",
  color: "#3b235f",
  fontSize: "19px",
  lineHeight: 1.35,
  boxShadow: "0 6px 18px rgba(76, 29, 149, 0.08)",
};

const shareButton = {
  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
  color: "white",
  border: "none",
  padding: "14px 24px",
  borderRadius: "16px",
  fontSize: "20px",
  cursor: "pointer",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
  marginTop: "6px",
  boxShadow: "0 6px 16px rgba(76, 29, 149, 0.25)",
};

