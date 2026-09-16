"use client";

import { useState } from "react";

const COLORS = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
}

function generatePieces(): Piece[] {
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.4,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
  }));
}

export default function Confetti() {
  const [pieces] = useState<Piece[]>(generatePieces);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
