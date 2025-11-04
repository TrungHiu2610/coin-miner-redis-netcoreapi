import { api } from "../services/apiClient";
import toast from "react-hot-toast";
import Card from "./Card";

const AVAILABLE_MACHINES = [
  { name: "Basic Miner", cps: 1, cost: 50 },
  { name: "Advanced Rig", cps: 5, cost: 250 },
  { name: "Mega Drill", cps: 20, cost: 1200 },
  { name: "Quantum Harvester", cps: 100, cost: 7500 },
];

export default function Inventory({ token, currentCoins, onPurchase }) {
  const handleBuy = async (machine) => {
    if (currentCoins < machine.cost) {
      toast.error("Not enough coins!");
      return;
    }
    try {
      const res = await api.buyMachine(machine);
      if (res.status >= 200 && res.status < 300) {
        toast.success(`Bought ${machine.name}!`);
        onPurchase();
      } else {
        const err = await res.data;
        toast.error(err.message || "Purchase failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card title="Machine Shop">
      <div className="space-y-3">
        {AVAILABLE_MACHINES.map((machine) => (
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
    </Card>
  );
}
