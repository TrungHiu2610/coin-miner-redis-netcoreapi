import { api } from "../services/apiClient";
import toast from "react-hot-toast";
import Card from "./Card";

const AVAILABLE_BOOSTS = [
  {
    type: "click",
    multiplier: 2,
    duration: 30,
    cost: 100,
    name: "x2 Click (30s)",
  },
  {
    type: "passive",
    multiplier: 2,
    duration: 60,
    cost: 500,
    name: "x2 Passive (60s)",
  },
];

export default function BoostPanel({ currentCoins, onPurchase }) {
  const handleActivate = async (boost) => {
    if (currentCoins < boost.cost) {
      toast.error("Not enough coins!");
      return;
    }
    try {
      const res = await api.activateBoost(boost);
      if (res.status >= 200 && res.status < 300) {
        toast.success(`${boost.name} activated!`, { icon: "🚀" });
        onPurchase();
      } else {
        const err = await res.json();
        toast.error(err.message || "Activation failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card title="Boosters">
      <div className="space-y-3">
        {AVAILABLE_BOOSTS.map((boost) => (
          <div
            key={boost.name}
            className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg"
          >
            <p className="font-bold">{boost.name}</p>
            <button
              onClick={() => handleActivate(boost)}
              disabled={currentCoins < boost.cost}
              className="px-3 py-1 text-sm font-semibold bg-purple-600 hover:bg-purple-500 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {boost.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
