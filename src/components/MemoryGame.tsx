"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameCard from "@/components/GameCard";
import Confetti from "@/components/Confetti";
import {
  createDeck,
  DIFFICULTY_CONFIG,
  formatTime,
  loadBestScore,
  saveBestScore,
  type BestScore,
  type CardData,
  type Difficulty,
} from "@/lib/game";
import {
  playFlipSound,
  playMatchSound,
  playMismatchSound,
  playWinSound,
} from "@/lib/sound";

type Phase = "start" | "playing" | "won";

export default function MemoryGame() {
  const [phase, setPhase] = useState<Phase>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const startGame = useCallback((level: Difficulty) => {
    setDifficulty(level);
    setCards(createDeck(level));
    setFlippedIds([]);
    setMoves(0);
    setSeconds(0);
    setIsNewRecord(false);
    setBestScore(loadBestScore(level));
    isCheckingRef.current = false;
    setPhase("playing");
  }, []);

  const handleCardClick = useCallback(
    (id: number) => {
      if (isCheckingRef.current) return;
      const clicked = cards.find((c) => c.id === id);
      if (!clicked || clicked.isFlipped || clicked.isMatched) return;

      if (!muted) playFlipSound();

      const updatedCards = cards.map((c) =>
        c.id === id ? { ...c, isFlipped: true } : c,
      );
      setCards(updatedCards);

      const nextFlippedIds = [...flippedIds, id];
      setFlippedIds(nextFlippedIds);

      if (nextFlippedIds.length !== 2) return;

      isCheckingRef.current = true;
      const newMoves = moves + 1;
      setMoves(newMoves);

      const [firstId, secondId] = nextFlippedIds;
      const first = updatedCards.find((c) => c.id === firstId);
      const second = updatedCards.find((c) => c.id === secondId);
      const isMatch = !!first && !!second && first.symbol === second.symbol;

      setTimeout(() => {
        const result = updatedCards.map((c) => {
          if (c.id !== firstId && c.id !== secondId) return c;
          return isMatch
            ? { ...c, isMatched: true, isFlipped: false }
            : { ...c, isFlipped: false };
        });
        setCards(result);
        setFlippedIds([]);
        isCheckingRef.current = false;

        if (isMatch) {
          if (!muted) playMatchSound();
          if (result.every((c) => c.isMatched)) {
            setPhase("won");
            if (!muted) playWinSound();
            const improved = saveBestScore(difficulty, {
              moves: newMoves,
              time: seconds,
            });
            setIsNewRecord(improved);
            setBestScore(loadBestScore(difficulty));
          }
        } else if (!muted) {
          playMismatchSound();
        }
      }, isMatch ? 350 : 800);
    },
    [cards, flippedIds, moves, seconds, muted, difficulty],
  );

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-8">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          🧠 記憶翻牌配對
        </h1>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "取消靜音" : "靜音"}
          className="rounded-full bg-white/70 p-2 text-xl shadow hover:bg-white"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </header>

      {phase === "start" && (
        <div className="flex w-full flex-col items-center gap-6 rounded-2xl bg-white/70 p-8 shadow-lg">
          <p className="text-center text-slate-600">
            翻開卡片找出成對的圖案，用最少的次數與時間完成配對！
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => startGame(level)}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-indigo-700 active:scale-95"
              >
                {DIFFICULTY_CONFIG[level].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {phase !== "start" && (
        <>
          <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 px-5 py-3 shadow">
            <span className="font-medium text-slate-700">
              難度：{config.label}
            </span>
            <span className="font-medium text-slate-700">步數：{moves}</span>
            <span className="font-medium text-slate-700">
              時間：{formatTime(seconds)}
            </span>
            {bestScore && (
              <span className="text-sm text-slate-500">
                最佳紀錄：{bestScore.moves} 步 / {formatTime(bestScore.time)}
              </span>
            )}
          </div>

          <div className={`grid w-full gap-2 sm:gap-3 ${config.cols}`}>
            {cards.map((card) => (
              <GameCard
                key={card.id}
                card={card}
                disabled={phase !== "playing" || flippedIds.includes(card.id)}
                onClick={() => handleCardClick(card.id)}
              />
            ))}
          </div>

          {phase === "won" && (
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl bg-white/80 p-8 text-center shadow-lg">
              {isNewRecord && (
                <p className="text-lg font-bold text-amber-500">🎉 新紀錄！</p>
              )}
              <p className="text-xl font-bold text-slate-800">
                恭喜完成！用了 {moves} 步、{formatTime(seconds)}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => startGame(difficulty)}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow hover:bg-indigo-700 active:scale-95"
                >
                  再玩一次
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("start")}
                  className="rounded-xl bg-slate-200 px-5 py-2.5 font-semibold text-slate-700 shadow hover:bg-slate-300 active:scale-95"
                >
                  選擇難度
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {phase === "won" && <Confetti />}
    </div>
  );
}
