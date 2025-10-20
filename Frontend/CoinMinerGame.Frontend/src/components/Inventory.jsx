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
            className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg"
          >
            <div>
              <p className="font-bold">{machine.name}</p>
              <p className="text-sm text-cyan-400">+ {machine.cps} CPS</p>
            </div>
            <button
              onClick={() => handleBuy(machine)}
              disabled={currentCoins < machine.cost}
              className="px-3 py-1 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {machine.cost.toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
