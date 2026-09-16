export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyConfig {
  pairs: number;
  cols: string;
  label: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { pairs: 6, cols: "grid-cols-3 sm:grid-cols-4", label: "簡單・6 對" },
  medium: { pairs: 8, cols: "grid-cols-4", label: "中等・8 對" },
  hard: { pairs: 12, cols: "grid-cols-4 sm:grid-cols-6", label: "困難・12 對" },
};

const SYMBOL_POOL = [
  "🍎", "🍌", "🍇", "🍉", "🍒", "🍋", "🥝", "🍓",
  "🍍", "🥥", "🍑", "🥕", "🌽", "🍄", "🍕", "🍔",
  "🎲", "🎯", "⚽", "🏀", "🎸", "🚀", "🌈", "⭐",
];

export interface CardData {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createDeck(difficulty: Difficulty): CardData[] {
  const { pairs } = DIFFICULTY_CONFIG[difficulty];
  const symbols = shuffle(SYMBOL_POOL).slice(0, pairs);
  const deck = shuffle([...symbols, ...symbols]).map((symbol, index) => ({
    id: index,
    symbol,
    isFlipped: false,
    isMatched: false,
  }));
  return deck;
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export interface BestScore {
  moves: number;
  time: number;
}

const STORAGE_PREFIX = "memory-game-best-";

export function loadBestScore(difficulty: Difficulty): BestScore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + difficulty);
    if (!raw) return null;
    return JSON.parse(raw) as BestScore;
  } catch {
    return null;
  }
}

export function saveBestScore(difficulty: Difficulty, score: BestScore): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = loadBestScore(difficulty);
    const isBetter =
      !current ||
      score.moves < current.moves ||
      (score.moves === current.moves && score.time < current.time);
    if (isBetter) {
      window.localStorage.setItem(STORAGE_PREFIX + difficulty, JSON.stringify(score));
    }
    return isBetter;
  } catch {
    return false;
  }
}
