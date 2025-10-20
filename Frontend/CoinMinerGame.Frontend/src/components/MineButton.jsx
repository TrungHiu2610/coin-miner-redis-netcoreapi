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
        className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-white font-bold text-2xl shadow-lg shadow-orange-500/20 transform transition-transform duration-150 active:scale-90 hover:scale-105 flex flex-col justify-center items-center"
        onClick={handleClick}
      >
        <span className="text-5xl mb-2">⛏️</span>
        MINE
      </button>
    </div>
  );
}
