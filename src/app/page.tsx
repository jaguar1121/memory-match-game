import MemoryGame from "@/components/MemoryGame";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-sky-100 to-purple-100">
      <MemoryGame />
    </div>
  );
}
