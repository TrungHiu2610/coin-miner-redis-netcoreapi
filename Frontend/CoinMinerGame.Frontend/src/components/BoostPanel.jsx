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
        toast.success(`${boost.name} activated!`, { icon: ">>" });
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
            className="flex items-center justify-between rounded-xl border border-purple-400/20 bg-slate-900/70 px-4 py-3 transition hover:border-purple-400/40 hover:bg-slate-900/80"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-200">
                {boost.name}
              </p>
              <p className="text-xs text-slate-400">
                Duration: {boost.duration}s / x{boost.multiplier}
              </p>
            </div>
            <button
              onClick={() => handleActivate(boost)}
              disabled={currentCoins < boost.cost}
              className="rounded-full border border-purple-400/40 bg-purple-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-100 transition hover:border-purple-400 hover:bg-purple-500/30 disabled:border-slate-500 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:hover:border-slate-500 disabled:hover:bg-slate-800/60"
            >
              {boost.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
