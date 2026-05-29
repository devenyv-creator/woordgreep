import { Alegreya } from "next/font/google";

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function Home() {
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
          maxWidth: "560px",
          background: "#ffe66d",
          padding: "48px 36px",
          boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
          transform: "rotate(-1deg)",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            margin: "0 0 18px",
            color: "#6d28d9",
            fontWeight: 700,
          }}
        >
          Woordgreep
        </h1>

        <p
          style={{
            fontSize: "30px",
            lineHeight: 1.35,
            color: "#2b2118",
            margin: "0 0 28px",
          }}
        >
          Binnenkort kun je hier dagelijks spelen.
        </p>

        <p
          style={{
            fontSize: "22px",
            color: "#2b2118",
            margin: 0,
          }}
        >
          Volg ondertussen de hints op TikTok ♡
        </p>
      </section>
    </main>
  );
}
