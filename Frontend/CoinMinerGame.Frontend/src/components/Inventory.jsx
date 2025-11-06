import { useEffect, useState } from "react";
import { api } from "../services/apiClient";
import toast from "react-hot-toast";
import Card from "./Card";

export default function Inventory({ token, currentCoins, onPurchase }) {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await api.getMachines();
        setMachines(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load machines", err);
        toast.error("Failed to load machine shop");
      } finally {
        setLoading(false);
      }
    };

    fetchMachines();
  }, []);

  const handleBuy = async (machine) => {
    if (currentCoins < machine.cost) {
      toast.error("Not enough coins!");
      return;
    }

    try {
      await api.buyMachine({ name: machine.name });

      toast.success(`Bought ${machine.name}!`, { icon: "🪙" });
      onPurchase();
    } catch (err) {
      console.error("Buy machine failed:", err);
      const msg = err.response?.data?.message || "Purchase failed";
      toast.error(msg);
    }
  };

  return (
    <Card title="Machine Shop">
      {loading ? (
        <div className="py-6 text-center text-slate-400 text-sm">
          Loading machines...
        </div>
      ) : (
        <div className="space-y-3">
          {machines.map((machine) => (
            <div
              key={machine.name}
              className="flex items-center justify-between rounded-xl border border-cyan-400/15 bg-slate-900/70 px-4 py-3 transition hover:border-cyan-400/35 hover:bg-slate-900/80"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {machine.name}
                </p>
                <p className="text-xs text-slate-400">
                  Output Boost: +{machine.cps} cps
                </p>
              </div>
              <button
                onClick={() => handleBuy(machine)}
                disabled={currentCoins < machine.cost}
                className="rounded-full border border-teal-400/40 bg-teal-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-teal-200 transition hover:border-teal-300 hover:bg-teal-400/30 disabled:border-slate-500 disabled:bg-slate-800/60 disabled:text-slate-500 disabled:hover:border-slate-500 disabled:hover:bg-slate-800/60"
              >
                {machine.cost.toLocaleString()}
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
