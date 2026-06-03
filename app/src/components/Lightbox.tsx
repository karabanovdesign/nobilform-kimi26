import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  image: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  isOpen,
  title,
  subtitle,
  image,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center"
      style={{ background: "rgba(13, 13, 13, 0.97)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center rounded-full transition-colors hover:bg-white/10"
      >
        <X className="w-7 h-7" style={{ color: "#f5f3ef" }} />
      </button>

      <button
        onClick={onPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full border transition-colors hover:border-[#b8945a] hover:text-[#b8945a]"
        style={{
          borderColor: "rgba(184, 148, 90, 0.3)",
          color: "#f5f3ef",
        }}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full border transition-colors hover:border-[#b8945a] hover:text-[#b8945a]"
        style={{
          borderColor: "rgba(184, 148, 90, 0.3)",
          color: "#f5f3ef",
        }}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <img
        src={image}
        alt={title}
        className="max-w-[90%] max-h-[80vh] object-contain rounded"
      />

      <div className="text-center mt-6">
        <h3
          className="text-2xl font-normal"
          style={{
            color: "#f5f3ef",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm mt-1 tracking-[3px] uppercase"
          style={{ color: "#b8945a" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
