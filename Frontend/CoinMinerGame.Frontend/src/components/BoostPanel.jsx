import { useEffect, useState } from "react";
import { api } from "../services/apiClient";
import toast from "react-hot-toast";
import Card from "./Card";

export default function BoostPanel({
  currentCoins,
  onPurchase,
  activeBoosts,
  now,
  onBoostActivated,
}) {
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoosts = async () => {
      try {
        const res = await api.getBoosts();
        setBoosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load boosts:", err);
        toast.error("Failed to load boosters");
      } finally {
        setLoading(false);
      }
    };

    fetchBoosts();
  }, []);

  const handleActivate = async (boost) => {
    if (currentCoins < boost.cost) {
      toast.error("Not enough coins!");
      return;
    }

    try {
      await api.activateBoost({ type: boost.type, name: boost.name });

      toast.success(`${boost.name} activated!`, { icon: "🚀" });

      if (typeof onBoostActivated === "function") {
        onBoostActivated(boost);
      }
      if (typeof onPurchase === "function") {
        onPurchase();
      }
    } catch (err) {
      console.error("Activate boost failed:", err);
      const msg = err.response?.data?.message || "Activation failed";
      toast.error(msg);
    }
  };

  return (
    <Card title="Boosters">
      {loading ? (
        <div className="py-6 text-center text-slate-400 text-sm">
          Loading boosters...
        </div>
      ) : (
        <div className="space-y-3">
          {boosts.map((boost) => {
            const typeActive =
              activeBoosts && activeBoosts[boost.type]
                ? activeBoosts[boost.type]
                : null;

            const isMatchingBoostActive =
              typeActive &&
              typeActive.name === boost.name &&
              typeActive.expiresAt > now;

            let remainingSeconds = 0;
            if (isMatchingBoostActive) {
              remainingSeconds = Math.max(
                0,
                Math.ceil((typeActive.expiresAt - now) / 1000)
              );
            }

            return (
              <div
                key={boost.name}
                className="flex justify-between items-center bg-slate-900/60 border border-purple-400/20 rounded-xl px-4 py-3 hover:bg-slate-900/80 hover:border-purple-400/40 transition"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-200">
                    {boost.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {boost.type === "click" ? "Click boost" : "Passive boost"} ·
                    x{boost.multiplier} · {boost.duration}s
                  </p>
                  {isMatchingBoostActive && (
                    <p className="text-xs text-emerald-300 mt-1">
                      Active · {remainingSeconds}s left
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleActivate(boost)}
                  disabled={currentCoins < boost.cost || isMatchingBoostActive}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] rounded-full border border-purple-400/40 bg-purple-500/20 text-purple-100 hover:bg-purple-500/30 hover:border-purple-400 disabled:bg-slate-800/60 disabled:border-slate-500 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                >
                  {boost.cost.toLocaleString()}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
