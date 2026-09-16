"use client";

import type { CardData } from "@/lib/game";

interface GameCardProps {
  card: CardData;
  onClick: () => void;
  disabled: boolean;
}

export default function GameCard({ card, onClick, disabled }: GameCardProps) {
  const isRevealed = card.isFlipped || card.isMatched;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isRevealed}
      aria-label={isRevealed ? `卡片：${card.symbol}` : "翻牌"}
      data-testid="game-card"
      className="card-flip-container aspect-square w-full disabled:cursor-default"
    >
      <div className={`card-flip-inner ${isRevealed ? "is-flipped" : ""}`}>
        <div className="card-face card-face-back bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
          <span className="text-xl sm:text-2xl">❓</span>
        </div>
        <div
          className={`card-face card-face-front shadow-md ${
            card.isMatched
              ? "bg-emerald-100 ring-2 ring-emerald-400"
              : "bg-white"
          }`}
        >
          <span className="text-2xl sm:text-4xl">{card.symbol}</span>
        </div>
      </div>
    </button>
  );
}
