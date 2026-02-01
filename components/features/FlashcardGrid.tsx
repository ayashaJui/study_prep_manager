"use client";

import { useState } from "react";
import { X, Edit2 } from "lucide-react";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardGridProps {
  flashcards: Flashcard[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function FlashcardGrid({
  flashcards,
  onDelete,
  onEdit,
}: FlashcardGridProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlip = (id: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedCards(newFlipped);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 !mt-3 md:!mt-4">
      {flashcards.map((card) => (
        <div
          key={card.id}
          className="h-52 perspective-1000 cursor-pointer relative group"
          onClick={() => toggleFlip(card.id)}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              flippedCards.has(card.id) ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden flex items-center justify-center !p-6 rounded-xl text-lg font-medium bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white shadow-2xl border border-white/10">
              <div className="text-center">
                <div className="whitespace-pre-wrap">{card.front}</div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs opacity-70">
                  Click to flip
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center !p-6 rounded-xl text-lg font-medium bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white shadow-2xl border border-white/10">
              <div className="text-center whitespace-pre-wrap">{card.back}</div>
            </div>
          </div>

          {(onEdit || onDelete) && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(card.id);
                  }}
                  className="w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card.id);
                  }}
                  className="w-7 h-7 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
