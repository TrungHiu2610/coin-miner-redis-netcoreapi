import { api } from "../services/apiClient";

export default function MineButton({ token }) {
  const handleClick = async () => {
    try {
      await api.mine();
    } catch (err) {
      console.error("Mine failed:", err);
    }
  };

  return (
    <div className="flex justify-center">
      <button
        className="neon-button h-48 w-48 flex-col gap-3 sm:h-60 sm:w-60"
        onClick={handleClick}
      >
        <span className="text-5xl mb-2">⛏️</span>
        <span className="text-xs tracking-[0.25em]">Tap To</span>
        <span className="text-lg tracking-[0.4em]">Mine</span>
      </button>
    </div>
  );
}
