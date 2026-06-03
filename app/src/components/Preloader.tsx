import { useState, useEffect } from "react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const holdTimer = setTimeout(() => setPhase("hold"), 1500);
    const exitTimer = setTimeout(() => setPhase("exit"), 2800);
    const doneTimer = setTimeout(() => onComplete(), 3800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: "#0d0d0d",
        opacity: phase === "exit" ? 0 : 1,
        transition: phase === "exit" ? "opacity 1s ease-out" : "none",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      <div
        style={{
          opacity: phase === "enter" ? 1 : phase === "hold" ? 1 : 0,
          transform:
            phase === "enter"
              ? "scale(0.3) translateY(40px)"
              : phase === "hold"
                ? "scale(1) translateY(0)"
                : "scale(1.2) translateY(-30px)",
          transition:
            phase === "enter"
              ? "all 1.2s cubic-bezier(0.22, 1, 0.36, 1)"
              : phase === "hold"
                ? "all 0.8s cubic-bezier(0.22, 1, 0.36, 1)"
                : "all 0.8s ease-in",
          filter: phase === "enter" ? "blur(8px) brightness(0.5)" : "blur(0px) brightness(1.1)",
        }}
      >
        <img
          src="/images/logo.png"
          alt="NobilForm by KVDesign"
          className="object-contain"
          style={{
            height: "clamp(200px, 35vh, 400px)",
            width: "auto",
          }}
        />
      </div>

      {/* Subtle glow under logo */}
      <div
        className="absolute rounded-full"
        style={{
          width: "300px",
          height: "100px",
          background: "radial-gradient(ellipse, rgba(184, 148, 90, 0.15) 0%, transparent 70%)",
          bottom: "30%",
          opacity: phase === "enter" ? 0 : phase === "hold" ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
      />
    </div>
  );
}
