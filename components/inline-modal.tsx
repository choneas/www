"use client";

import type { ReactNode } from "react";
import { useState } from "react";

interface InlineModalProps {
  children: ReactNode;
  className?: string;
  modal: {
    title: ReactNode;
    paragraphs: ReactNode[];
    image?: { src: string; alt: string };
  };
  modalProps?: { dialogClassName?: string };
}

export function InlineModal({ children, className, modal, modalProps }: InlineModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
          <div className={`max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-background p-6 ${modalProps?.dialogClassName ?? ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-xl font-semibold">{modal.title}</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="space-y-4">
              {modal.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              {modal.image ? <img src={modal.image.src} alt={modal.image.alt} /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
