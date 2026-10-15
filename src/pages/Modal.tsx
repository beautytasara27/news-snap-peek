import React, { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Escape to dismiss, and no background scrolling while open.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      <div className="glass-chrome animate-scale-in relative w-full max-w-md rounded-[1.5rem] border p-7 shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="focus-ring absolute right-4 top-4 grid size-8 place-items-center rounded-full text-news-subtle transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {title && (
          <h2 className="mb-6 font-display text-2xl font-medium tracking-tight text-news-header">{title}</h2>
        )}

        {children}
      </div>
    </div>
  );
};

export default Modal;
