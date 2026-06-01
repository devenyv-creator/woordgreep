"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { track } from "@vercel/analytics";
import { puzzles } from "./data/puzzles";

type HintType = "definitie" | "indicatoren" | "bouwstenen";

type ShownHints = {
  definitie: boolean;
  indicatoren: boolean;
  bouwstenen: boolean;
};

type SavedGame = {
  isSolved: boolean;
  guess: string;
  shownHints: ShownHints;
  showExplanation: boolean;
  notes?: string;
};

type StreakData = {
  currentStreak: number;
  bestStreak: number;
  lastSolvedDate: string | null;
};

const FIRST_PUZZLE_DATE = "2026-05-17";
const ARCHIVE_UNLOCK_KEY = "woordgreep-archive-unlocked-until";

const emptyShownHints: ShownHints = {
  definitie: false,
  indicatoren: false,
  bouwstenen: false,
};

function getTodayDateKey() {
  return new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Amsterdam",
  });
}

function getYesterdayDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toLocaleDateString("sv-SE");
}

function isArchiveUnlocked() {
  const unlockedUntil = localStorage.getItem(ARCHIVE_UNLOCK_KEY);
  if (!unlockedUntil) return false;
  return Date.now() < Number(unlockedUntil);
}

export default function Home() {
  const todayKey = getTodayDateKey();
  const yesterdayKey = getYesterdayDateKey(todayKey);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const playablePuzzles = useMemo(() => {
    return puzzles
      .map((puzzle) => ({
        ...puzzle,
        date: String(puzzle.date).trim(),
        answer: String(puzzle.answer).trim(),
      }))
      .filter(
        (puzzle) =>
          puzzle.date >= FIRST_PUZZLE_DATE && puzzle.date <= todayKey
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [todayKey]);

  const latestPuzzle = playablePuzzles[playablePuzzles.length - 1];

  const [selectedDateKey, setSelectedDateKey] = useState(
    latestPuzzle?.date ?? FIRST_PUZZLE_DATE
  );
  const [guess, setGuess] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [message, setMessage] = useState("");
  const [isSolved, setIsSolved] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [shownHints, setShownHints] = useState<ShownHints>(emptyShownHints);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [archiveUnlocked, setArchiveUnlocked] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const puzzle =
    playablePuzzles.find((puzzle) => puzzle.date === selectedDateKey) ?? null;

  const previousPuzzle = playablePuzzles
    .filter((puzzle) => puzzle.date < selectedDateKey)
    .at(-1);

  const nextPuzzle = playablePuzzles.find(
    (puzzle) => puzzle.date > selectedDateKey
  );

  const isToday = selectedDateKey === todayKey;
  const isFirstPuzzle = selectedDateKey === FIRST_PUZZLE_DATE;
  const isArchivePuzzle = selectedDateKey < todayKey;
  const archiveIsLocked = isArchivePuzzle && !archiveUnlocked;

  const allHintsShown =
    shownHints.definitie && shownHints.indicatoren && shownHints.bouwstenen;

  useEffect(() => {
    setArchiveUnlocked(isArchiveUnlocked());
  }, []);

  useEffect(() => {
    if (!latestPuzzle) return;

    const exists = playablePuzzles.some(
      (puzzle) => puzzle.date === selectedDateKey
    );

    if (!exists) {
      setSelectedDateKey(latestPuzzle.date);
    }
  }, [latestPuzzle, playablePuzzles, selectedDateKey]);

  useEffect(() => {
    const savedGameText = localStorage.getItem(
      `woordgreep-game-${selectedDateKey}`
    );

    if (savedGameText) {
      const savedGame: SavedGame = JSON.parse(savedGameText);
      setGuess(savedGame.guess ?? "");
      setNotes(savedGame.notes ?? "");
      setIsSolved(savedGame.isSolved);
      setShownHints(savedGame.shownHints ?? emptyShownHints);
      setShowExplanation(savedGame.showExplanation);
    } else {
      setGuess("");
      setNotes("");
      setMessage("");
      setIsSolved(false);
      setShownHints(emptyShownHints);
      setShowExplanation(false);
    }

    setShowNotes(false);
  }, [selectedDateKey]);

  useEffect(() => {
    const savedStreakText = localStorage.getItem("woordgreep-streak");

    if (savedStreakText) {
      const savedStreak: StreakData = JSON.parse(savedStreakText);
      setCurrentStreak(savedStreak.currentStreak);
      setBestStreak(savedStreak.bestStreak);
    }
  }, []);

  useEffect(() => {
    const handler = (event: any) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  function saveGame(newGame: SavedGame) {
    localStorage.setItem(
      `woordgreep-game-${selectedDateKey}`,
      JSON.stringify(newGame)
    );
  }

  function saveCurrentGame(
    newGuess = guess,
    newNotes = notes,
    newShownHints = shownHints
  ) {
    saveGame({
      isSolved,
      guess: newGuess,
      shownHints: newShownHints,
      showExplanation,
      notes: newNotes,
    });
  }

  async function unlockArchiveWithAd() {
    track("archive_ad_clicked", { date: selectedDateKey });

    setIsWatchingAd(true);
    setMessage("");

    setTimeout(() => {
      const twentyFourHoursFromNow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(ARCHIVE_UNLOCK_KEY, String(twentyFourHoursFromNow));

      setArchiveUnlocked(true);
      setIsWatchingAd(false);
      setMessage("Archief ontgrendeld voor 24 uur ✨");

      track("archive_unlocked", { date: selectedDateKey });
    }, 2200);
  }

  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setInstallPrompt(null);
      }
    } else {
      alert("Gebruik de deelknop van je browser en kies 'Zet op beginscherm' 📲");
    }
  }

  function updateStreakAfterSolve() {
    if (!isToday) return;

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

    const newCurrentStreak =
      streakData.lastSolvedDate === yesterdayKey
        ? streakData.currentStreak + 1
        : 1;

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
    if (!puzzle || archiveIsLocked) return;

    if (guess.replaceAll(" ", "").toLowerCase() === puzzle.answer.trim().toLowerCase()) {
      track("puzzle_solved", {
        date: selectedDateKey,
        isToday: String(isToday),
      });

      setMessage("Goed! 🎉");
      setIsSolved(true);
      setShowExplanation(true);

      saveGame({
        isSolved: true,
        guess,
        shownHints,
        showExplanation: true,
        notes,
      });

      updateStreakAfterSolve();
    } else {
      setMessage("Nog niet...");
    }
  }

function updateLetter(letter: string, position: number) {
  if (!puzzle || isSolved || archiveIsLocked) return;

  const cleanLetter = letter
    .replace(/[^a-zA-ZÀ-ÿ]/g, "")
    .slice(-1)
    .toUpperCase();

  const guessArray = guess
    .padEnd(puzzle.answer.length, " ")
    .split("")
    .slice(0, puzzle.answer.length);

  guessArray[position] = cleanLetter || " ";

  const nextGuess = guessArray.join("");

  setGuess(nextGuess);
  saveCurrentGame(nextGuess, notes);
  setMessage("");

  if (cleanLetter && position < puzzle.answer.length - 1) {
    inputRefs.current[position + 1]?.focus();
  }
}

function handleLetterKeyDown(
  event: React.KeyboardEvent<HTMLInputElement>,
  position: number
) {
  if (!puzzle) return;

  if (event.key === "Enter") {
    checkAnswer();
  }

  if (event.key === "Backspace") {
    event.preventDefault();

    const guessArray = guess
      .padEnd(puzzle.answer.length, " ")
      .split("")
      .slice(0, puzzle.answer.length);

    if (guessArray[position].trim()) {
      guessArray[position] = " ";
      const nextGuess = guessArray.join("");
      setGuess(nextGuess);
      saveCurrentGame(nextGuess, notes);
      return;
    }

    if (position > 0) {
      inputRefs.current[position - 1]?.focus();
      guessArray[position - 1] = " ";

      const nextGuess = guessArray.join("");
      setGuess(nextGuess);
      saveCurrentGame(nextGuess, notes);
    }
  }

  if (event.key === "ArrowLeft" && position > 0) {
    inputRefs.current[position - 1]?.focus();
  }

  if (event.key === "ArrowRight" && position < puzzle.answer.length - 1) {
    inputRefs.current[position + 1]?.focus();
  }
}

  function revealHint(type: HintType) {
    if (!puzzle || archiveIsLocked || isSolved) return;

    const nextShownHints = {
      ...shownHints,
      [type]: true,
    };

    setShownHints(nextShownHints);
    setMessage("");
    saveCurrentGame(guess, notes, nextShownHints);

    track("hint_used", {
      type,
      date: selectedDateKey,
      isToday: String(isToday),
    });
  }

  function giveUp() {
    if (!puzzle || archiveIsLocked) return;

    track("give_up_clicked", { date: selectedDateKey });

    setMessage(`Het antwoord is ${puzzle.answer.toUpperCase()}.`);
    setIsSolved(true);
    setShowExplanation(true);

    saveGame({
      isSolved: true,
      guess,
      shownHints,
      showExplanation: true,
      notes,
    });
  }

  async function shareResult() {
    track("share_clicked", {
      date: selectedDateKey,
      isToday: String(isToday),
    });

    const shareText = `Ik speelde Woordgreep vandaag 🔥
🔥 ${currentStreak}
👑 ${bestStreak}

Speel mee op woordgreep.nl`;

    if (navigator.share) {
      await navigator.share({
        title: "Woordgreep",
        text: shareText,
        url: "https://woordgreep.nl",
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      setMessage("Resultaat gekopieerd!");
    }
  }

  function goToPreviousPuzzle() {
    if (previousPuzzle) {
      setSelectedDateKey(previousPuzzle.date);
      setMessage("");
    }
  }

  function goToNextPuzzle() {
    if (nextPuzzle) {
      setSelectedDateKey(nextPuzzle.date);
      setMessage("");
    }
  }

  function goToToday() {
    if (latestPuzzle) {
      setSelectedDateKey(latestPuzzle.date);
      setMessage("");
    }
  }

  function renderHighlightedClue() {
    if (!puzzle) return null;

    const wordsToHighlight = [
      ...(shownHints.definitie
        ? puzzle.hints.definitie.map((word: string) => ({
            word,
            style: meaningHighlightStyle,
          }))
        : []),
      ...(shownHints.indicatoren
        ? puzzle.hints.indicatoren.map((word: string) => ({
            word,
            style: indicatorHighlightStyle,
          }))
        : []),
      ...(shownHints.bouwstenen
        ? puzzle.hints.bouwstenen.map((word: string) => ({
            word,
            style: buildingHighlightStyle,
          }))
        : []),
    ];

    let parts: React.ReactNode[] = [puzzle.clue];

wordsToHighlight.forEach(({ word, style }) => {
  let hasHighlighted = false;

  parts = parts.flatMap((part, index) => {
    if (typeof part !== "string") return [part];
    if (hasHighlighted) return [part];

    const wordIndex = part.indexOf(word);

    if (wordIndex === -1) return [part];

    hasHighlighted = true;

    return [
      part.slice(0, wordIndex),
      <span key={`${word}-${index}`} style={style}>
        {word}
      </span>,
      part.slice(wordIndex + word.length),
    ];
  });
});

    return parts;
  }

  function resetAnswer() {
    if (!puzzle || archiveIsLocked || isSolved) return;

    setGuess("");
    setMessage("");
    inputRefs.current[0]?.focus();
    saveCurrentGame("", notes, shownHints);

    track("answer_reset", {
      date: selectedDateKey,
      isToday: String(isToday),
    });
  }

  function replayPuzzle() {
    if (!puzzle) return;

    setGuess("");
    setMessage("");
    setIsSolved(false);
    setShowExplanation(false);

    const resetHints = {
      definitie: false,
      indicatoren: false,
      bouwstenen: false,
    };

    setShownHints(resetHints);

    saveGame({
      isSolved: false,
      guess: "",
      shownHints: resetHints,
      showExplanation: false,
      notes,
    });

    track("puzzle_replayed", {
      date: selectedDateKey,
      isToday: String(isToday),
    });
  }

  return (
    <main style={mainStyle}>
      <section style={sectionStyle}>
        <h1 style={titleStyle}>Woordgreep</h1>

        <div style={streakStyle}>
          <span>🔥 {currentStreak}</span>
          <span>👑 {bestStreak}</span>
        </div>

{typeof window !== "undefined" &&
  !window.matchMedia("(display-mode: standalone)").matches && (
    <div style={installWrapStyle}>
      <button onClick={installApp} style={installButton}>
        📲 Voeg toe aan beginscherm
      </button>
    </div>
)}

        <div style={archiveNavStyle}>
          <div style={navButtonSlotStyle}>
            {!isFirstPuzzle && previousPuzzle && (
              <button onClick={goToPreviousPuzzle} style={smallNavButton}>
                ← Vorige
              </button>
            )}
          </div>

          <span style={archiveTextStyle}>
            {isToday ? "Vandaag" : selectedDateKey}
          </span>

          <div style={navButtonSlotStyle}>
            {!isToday && nextPuzzle && (
              <button onClick={goToNextPuzzle} style={smallNavButton}>
                Volgende →
              </button>
            )}
          </div>
        </div>

        {!isToday && (
          <button onClick={goToToday} style={todayButton}>
            Terug naar vandaag
          </button>
        )}

        {!puzzle ? (
          <div style={infoBox}>Voor deze datum staat nog geen puzzel klaar.</div>
        ) : archiveIsLocked ? (
          <div style={lockedArchiveStyle}>
            <h2 style={lockedTitleStyle}>🔒 Archiefpuzzel</h2>

            <p style={lockedTextStyle}>
              Bekijk een korte advertentie om 24 uur toegang te krijgen tot het archief.
            </p>

            <button
              onClick={unlockArchiveWithAd}
              disabled={isWatchingAd}
              style={primaryButton}
            >
              {isWatchingAd ? "Advertentie laden..." : "▶ Bekijk advertentie"}
            </button>
          </div>
        ) : (
          <>
            <div style={stickyWrapStyle}>
              <div style={stickyNoteStyle}>
                <div style={tapeStyle} />

                <button
                  onClick={() => {
                    setShowNotes(!showNotes);
                    track("notes_toggled", { date: selectedDateKey });
                  }}
                  style={noteIconButton}
                  aria-label="Notitie openen"
                >
                  ✏️
                </button>

                <p style={clueStyle}>{renderHighlightedClue()}</p>

                <div style={answerSlotsStyle}>
                  {puzzle.answer.split("").map((_, index) => (
                    <span
                      key={`${puzzle.date}-slot-${index}`}
                      style={answerSlotLetterStyle}
                    >
                      {isSolved
                        ? puzzle.answer[index].toUpperCase()
                        : guess[index]?.toUpperCase() || "_"}
                    </span>
                  ))}
                </div>

                {showNotes && (
                  <div style={notebookStyle}>
                    <textarea
                      value={notes}
                      onChange={(event) => {
                        setNotes(event.target.value);
                        saveCurrentGame(guess, event.target.value);
                      }}
                      placeholder="Schrijf hier je gedachten..."
                      style={notebookTextareaStyle}
                    />
                  </div>
                )}
              </div>
            </div>

            {isArchivePuzzle && archiveUnlocked && (
              <div style={archiveUnlockedStyle}>✨ Archief ontgrendeld</div>
            )}

            <div style={letterInputWrapper}>
              <div
                style={{
                  ...letterInputStyle,
                  gridTemplateColumns: `repeat(${puzzle.answer.length}, minmax(0, 1fr))`,
                }}
              >
                {puzzle.answer.split("").map((_, index) => (
<input
  key={`${puzzle.date}-input-${index}`}
  ref={(element) => {
    inputRefs.current[index] = element;
  }}
  value={guess[index]?.trim() ?? ""}
  onChange={(event) => updateLetter(event.target.value, index)}
  onKeyDown={(event) => handleLetterKeyDown(event, index)}
  onFocus={(event) => event.target.select()}
  maxLength={1}
  disabled={isSolved}
  style={letterBoxStyle}
  aria-label={`Letter ${index + 1}`}
/>
                ))}
              </div>

              {!isSolved && guess.length > 0 && (
                <button onClick={resetAnswer} style={smallResetButton}>
                  ↺
                </button>
              )}
</div>

{!isSolved && (
  <button onClick={checkAnswer} style={wideCheckButton}>
    Controleer
  </button>
)}

<div style={hintRowStyle}>
              <button
                onClick={() => revealHint("definitie")}
                disabled={isSolved || shownHints.definitie}
                style={{
                  ...hintButton,
                  ...(shownHints.definitie ? activeMeaningHintButton : {}),
                }}
              >
                Definitie
              </button>

              <button
                onClick={() => revealHint("indicatoren")}
                disabled={isSolved || shownHints.indicatoren}
                style={{
                  ...hintButton,
                  ...(shownHints.indicatoren ? activeIndicatorHintButton : {}),
                }}
              >
                Indicatoren
              </button>

              <button
                onClick={() => revealHint("bouwstenen")}
                disabled={isSolved || shownHints.bouwstenen}
                style={{
                  ...hintButton,
                  ...(shownHints.bouwstenen ? activeBuildingHintButton : {}),
                }}
              >
                Bouwstenen
              </button>
            </div>

            {!isSolved && allHintsShown && (
              <button onClick={giveUp} style={secondaryButton}>
                Geef op
              </button>
            )}

            <div style={messageStyle}>{message}</div>

            {showExplanation && <div style={infoBox}>{puzzle.explanation}</div>}

            {isSolved && (
              <button onClick={shareResult} style={shareButton}>
                ↗ Deel resultaat
              </button>
            )}

            {isSolved && (
              <button onClick={replayPuzzle} style={replayButton}>
                ↺ Speel opnieuw
              </button>
            )}
          </>
        )}

        <div style={socialBox}>
          <h3 style={socialTitle}>📚 Dagelijkse uitleg</h3>

          <p style={socialText}>
            Elke avond plaatsen we een uitgebreide uitleg van de puzzel op social media.
          </p>

          <div style={socialLinks}>
            <a
              href="https://www.tiktok.com/@woordgreep_"
              target="_blank"
              rel="noopener noreferrer"
              style={socialButton}
            >
              🎵 TikTok
            </a>

            <a
              href="https://www.instagram.com/woordgreep_/"
              target="_blank"
              rel="noopener noreferrer"
              style={socialButton}
            >
              📸 Instagram
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61590202232262"
              target="_blank"
              rel="noopener noreferrer"
              style={socialButton}
            >
              👍 Facebook
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

const mainStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#fffdf7",
  backgroundImage:
    "linear-gradient(#d7e8ff 1px, transparent 1px), linear-gradient(90deg, #ffd6dc 1px, transparent 1px)",
  backgroundSize: "100% 34px, 80px 100%",
  fontFamily: "var(--font-alegreya), serif",
  padding: "14px",
  overflowX: "hidden",
  boxSizing: "border-box",
};

const sectionStyle: CSSProperties = {
  width: "100%",
  maxWidth: "680px",
  margin: "0 auto",
  textAlign: "center",
  position: "relative",
  boxSizing: "border-box",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(40px, 8vw, 64px)",
  margin: "0 0 2px",
  color: "#6d28d9",
  fontWeight: 800,
  lineHeight: 0.9,
  textDecoration: "underline",
  textDecorationThickness: "4px",
  textUnderlineOffset: "7px",
};

const streakStyle: CSSProperties = {
  color: "#6d28d9",
  fontSize: "20px",
  marginBottom: "8px",
  fontWeight: 800,
  display: "flex",
  justifyContent: "center",
  gap: "16px",
};

const installWrapStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "12px",
};

const installButton: CSSProperties = {
  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
  color: "white",
  border: "none",
  padding: "9px 18px",
  borderRadius: "15px",
  fontSize: "16px",
  cursor: "pointer",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
  boxShadow: "0 5px 13px rgba(76, 29, 149, 0.22)",
};

const archiveNavStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  marginBottom: "6px",
  flexWrap: "nowrap",
};

const navButtonSlotStyle: CSSProperties = {
  width: "106px",
  display: "flex",
  justifyContent: "center",
};

const archiveTextStyle: CSSProperties = {
  color: "#3b235f",
  fontSize: "16px",
  fontWeight: 800,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #ddd6fe",
  borderRadius: "999px",
  padding: "7px 12px",
  whiteSpace: "nowrap",
};

const smallNavButton: CSSProperties = {
  width: "100px",
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  border: "2px solid #ddd6fe",
  padding: "7px 9px",
  borderRadius: "999px",
  fontSize: "15px",
  cursor: "pointer",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
};

const todayButton: CSSProperties = {
  background: "transparent",
  color: "#6d28d9",
  border: "none",
  fontSize: "15px",
  textDecoration: "underline",
  cursor: "pointer",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
  marginBottom: "6px",
};

const stickyWrapStyle: CSSProperties = {
  position: "relative",
};

const stickyNoteStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "linear-gradient(135deg, #fff176, #ffe45c)",
  padding: "32px 22px",
  minHeight: "180px",
  boxShadow: "0 16px 30px rgba(76, 29, 149, 0.18)",
  transform: "rotate(-0.7deg)",
  marginBottom: "24px",
  position: "relative",
  borderRadius: "2px",
};

const tapeStyle: CSSProperties = {
  position: "absolute",
  top: "8px",
  left: "10px",
  background: "#c4b5fd",
  width: "54px",
  height: "18px",
  transform: "rotate(-14deg)",
  opacity: 0.85,
};

const noteIconButton: CSSProperties = {
  position: "absolute",
  right: "10px",
  bottom: "10px",
  width: "42px",
  height: "42px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  border: "2px solid rgba(109,40,217,0.22)",
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  fontSize: "20px",
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 5px 12px rgba(76, 29, 149, 0.12)",
  zIndex: 3,
  padding: 0,
};

const clueStyle: CSSProperties = {
  color: "#2b2118",
  fontSize: "clamp(23px, 4.7vw, 31px)",
  lineHeight: 1.08,
  margin: "0 0 24px",
  fontWeight: 700,
};

const answerSlotsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "10px",
  flexWrap: "nowrap",
  color: "#2b2118",
  fontSize: "clamp(26px, 8vw, 34px)",
  fontWeight: 800,
  letterSpacing: "0",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

const answerSlotLetterStyle: CSSProperties = {
  minWidth: "16px",
  fontSize: "30px",
  lineHeight: 1,
};

const letterInputWrapper: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "8px",
  marginBottom: "10px",
  width: "100%",
  boxSizing: "border-box",
};

const letterInputStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  justifyContent: "center",
  width: "fit-content",
  margin: "0 auto",
};

const letterBoxStyle: CSSProperties = {
  width: "clamp(48px, 11vw, 64px)",
  aspectRatio: "1 / 1",
  border: "3px solid #8b5cf6",
  borderRadius: "14px",
  textAlign: "center",
  fontSize: "clamp(22px, 6vw, 30px)",
  fontWeight: 800,
  color: "#2b2118",
  background: "white",
  fontFamily: "var(--font-alegreya), serif",
  outline: "none",
  boxSizing: "border-box",
};

const smallResetButton: CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  border: "2px solid #ddd6fe",
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  fontSize: "20px",
  cursor: "pointer",
  fontWeight: 800,
  boxShadow: "0 4px 0 #ddd6fe",
  flexShrink: 0,
};

const wideCheckButton: CSSProperties = {
  width: "100%",
  background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
  color: "white",
  border: "none",
  padding: "12px 22px",
  borderRadius: "16px",
  fontSize: "22px",
  cursor: "pointer",
  boxShadow: "0 6px 0 #4c1d95",
  fontFamily: "var(--font-alegreya), serif",
  margin: "0 auto 12px",
  fontWeight: 800,
};

const hintRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "8px",
  marginBottom: "8px",
};

const hintButton: CSSProperties = {
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  border: "2px solid #c4b5fd",
  padding: "10px 6px",
  borderRadius: "14px",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 4px 0 #ddd6fe",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
};

const activeMeaningHintButton: CSSProperties = {
  color: "#2563eb",
  borderColor: "#2563eb",
  background: "rgba(37, 99, 235, 0.08)",
  boxShadow: "0 4px 0 rgba(37, 99, 235, 0.2)",
};

const activeIndicatorHintButton: CSSProperties = {
  color: "#16a34a",
  borderColor: "#16a34a",
  background: "rgba(22, 163, 74, 0.08)",
  boxShadow: "0 4px 0 rgba(22, 163, 74, 0.2)",
};

const activeBuildingHintButton: CSSProperties = {
  color: "#dc2626",
  borderColor: "#dc2626",
  background: "rgba(220, 38, 38, 0.08)",
  boxShadow: "0 4px 0 rgba(220, 38, 38, 0.2)",
};

const meaningHighlightStyle: CSSProperties = {
  color: "#2563eb",
  fontWeight: 900,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const indicatorHighlightStyle: CSSProperties = {
  color: "#16a34a",
  fontWeight: 900,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const buildingHighlightStyle: CSSProperties = {
  color: "#dc2626",
  fontWeight: 900,
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const notebookStyle: CSSProperties = {
  margin: "14px 44px 0 0",
  background: "#fffdf7",
  border: "2px solid #ddd6fe",
  borderRadius: "14px",
  padding: "8px",
  boxShadow: "0 5px 12px rgba(76, 29, 149, 0.08)",
  transform: "rotate(1deg)",
};

const notebookTextareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "70px",
  boxSizing: "border-box",
  border: "none",
  outline: "none",
  resize: "vertical",
  backgroundColor: "#fffdf7",
  backgroundImage: "linear-gradient(#d7e8ff 1px, transparent 1px)",
  backgroundSize: "100% 24px",
  fontSize: "17px",
  lineHeight: "24px",
  color: "#2b2118",
  fontFamily: "var(--font-alegreya), serif",
  padding: "4px",
};

const secondaryButton: CSSProperties = {
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  border: "2px solid #8b5cf6",
  padding: "10px 18px",
  borderRadius: "15px",
  fontSize: "18px",
  cursor: "pointer",
  boxShadow: "0 4px 0 #ddd6fe",
  fontFamily: "var(--font-alegreya), serif",
  margin: "0 6px 8px",
  fontWeight: 800,
};

const messageStyle: CSSProperties = {
  minHeight: "24px",
  color: "#6d28d9",
  fontSize: "20px",
  marginBottom: "6px",
  fontWeight: 700,
};

const infoBox: CSSProperties = {
  marginTop: "10px",
  background: "rgba(255,255,255,0.9)",
  border: "1px solid #ddd6fe",
  borderRadius: "16px",
  padding: "12px 16px",
  color: "#3b235f",
  fontSize: "17px",
  lineHeight: 1.3,
  boxShadow: "0 5px 14px rgba(76, 29, 149, 0.07)",
};

const lockedArchiveStyle: CSSProperties = {
  marginTop: "4px",
  background: "rgba(255,255,255,0.94)",
  border: "2px solid #ddd6fe",
  borderRadius: "20px",
  padding: "18px 16px",
  color: "#3b235f",
  boxShadow: "0 7px 18px rgba(76, 29, 149, 0.1)",
};

const lockedTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#6d28d9",
  fontSize: "26px",
};

const lockedTextStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: "18px",
  lineHeight: 1.3,
};

const primaryButton: CSSProperties = {
  background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
  color: "white",
  border: "none",
  padding: "12px 24px",
  borderRadius: "15px",
  fontSize: "19px",
  cursor: "pointer",
  boxShadow: "0 5px 0 #4c1d95",
  fontFamily: "var(--font-alegreya), serif",
  margin: "0 6px 10px",
  fontWeight: 800,
};

const archiveUnlockedStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "9px",
  background: "#ede9fe",
  color: "#6d28d9",
  border: "1px solid #ddd6fe",
  borderRadius: "999px",
  padding: "6px 13px",
  fontSize: "15px",
  fontWeight: 800,
};

const shareButton: CSSProperties = {
  background: "linear-gradient(135deg, #7c3aed, #9333ea)",
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "15px",
  fontSize: "18px",
  cursor: "pointer",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
  marginTop: "6px",
  boxShadow: "0 5px 14px rgba(76, 29, 149, 0.22)",
};

const replayButton: CSSProperties = {
  background: "rgba(255,255,255,0.96)",
  color: "#6d28d9",
  border: "2px solid #8b5cf6",
  padding: "10px 18px",
  borderRadius: "15px",
  fontSize: "18px",
  cursor: "pointer",
  fontFamily: "var(--font-alegreya), serif",
  fontWeight: 800,
  marginTop: "10px",
  marginLeft: "10px",
  boxShadow: "0 4px 0 #ddd6fe",
};

const socialBox: CSSProperties = {
  marginTop: "16px",
  marginBottom: "16px",
  background: "rgba(255,255,255,0.92)",
  border: "1px solid #ddd6fe",
  borderRadius: "16px",
  padding: "14px",
  boxShadow: "0 5px 14px rgba(76, 29, 149, 0.07)",
};

const socialTitle: CSSProperties = {
  color: "#6d28d9",
  margin: "0 0 8px",
  fontSize: "20px",
};

const socialText: CSSProperties = {
  margin: "0 0 10px",
  color: "#2b2118",
  fontSize: "15px",
  lineHeight: 1.3,
};

const socialLinks: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const socialButton: CSSProperties = {
  background: "white",
  color: "#6d28d9",
  border: "2px solid #ddd6fe",
  padding: "8px 12px",
  borderRadius: "13px",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "15px",
};