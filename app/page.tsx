"use client";

import { useState } from "react";
import { Alegreya } from "next/font/google";

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [solved, setSolved] = useState(false);

  function checkAnswer() {
    if (guess.trim().toLowerCase() === "wissel") {
      setSolved(true);
      setMessage("Goed! 🎉");
    } else {
      setMessage("Nog niet...");
    }
  }

  return (
    <main
      className={alegreya.className}
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fffdf7",
        backgroundImage:
          "linear-gradient(#d7e8ff 1px, transparent 1px), linear-gradient(90deg, #ffd6dc 1px, transparent 1px)",
        backgroundSize: "100% 34px, 80px 100%",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <section
        style={{
          maxWidth: "600px",
          background: "#ffe66d",
          padding: "42px 34px",
          boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
          transform: "rotate(-1deg)",
        }}
      >
        <h1
          style={{
            fontSize: "58px",
            margin: "0 0 16px",
            color: "#6d28d9",
            fontWeight: 700,
          }}
        >
          Woordgreep
        </h1>

        <p
          style={{
            fontSize: "28px",
            lineHeight: 1.3,
            color: "#2b2118",
            margin: "0 0 24px",
          }}
        >
          Binnenkort kun je hier dagelijks spelen.
        </p>

        <p
          style={{
            fontSize: "21px",
            color: "#2b2118",
            margin: "0 0 30px",
          }}
        >
          Volg ondertussen de hints op TikTok, Instagram of Facebook ♡
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.75)",
            border: "2px solid #c4b5fd",
            borderRadius: "18px",
            padding: "22px",
          }}
        >
          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.35,
              color: "#2b2118",
              margin: "0 0 18px",
              fontWeight: 700,
            }}
          >
            Start WK is de laatste voor Memphis, selectie incompleet na
            last-minute verandering (6).
          </p>

          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") checkAnswer();
            }}
            placeholder="Typ je antwoord..."
            disabled={solved}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "2px solid #c4b5fd",
              fontSize: "20px",
              marginBottom: "14px",
              fontFamily: "inherit",
            }}
          />

          <button
            onClick={checkAnswer}
            disabled={solved}
            style={{
              background: solved ? "#a78bfa" : "#6d28d9",
              color: "white",
              border: "none",
              padding: "13px 26px",
              borderRadius: "16px",
              fontSize: "20px",
              cursor: solved ? "default" : "pointer",
              boxShadow: "0 6px 0 #4c1d95",
              fontFamily: "inherit",
              fontWeight: 700,
            }}
          >
            Controleer
          </button>

          <div
            style={{
              minHeight: "28px",
              marginTop: "14px",
              color: "#6d28d9",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {message}
          </div>

          {solved && (
            <p
              style={{
                fontSize: "19px",
                lineHeight: 1.35,
                color: "#2b2118",
                margin: "10px 0 0",
              }}
            >
              Antwoord: <strong>WISSEL</strong>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}