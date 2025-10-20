import { useEffect, useState } from "react";

export default function CoinCounter({ coins, cps }) {
  const [lastValidCps, setLastValidCps] = useState(() => {
    const parsed = Number(cps);
    return Number.isFinite(parsed) ? parsed : 0;
  });

  useEffect(() => {
    const parsed = Number(cps);
    if (Number.isFinite(parsed) && parsed > 0) {
      setLastValidCps(parsed);
    }
  }, [cps]);

  const formatNumber = (num) =>
    num.toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="text-center bg-slate-900/50 p-6 rounded-xl border border-slate-700">
      <h2 className="text-5xl font-bold text-amber-400 tracking-wider">
        {formatNumber(coins)}
      </h2>
      <p className="text-slate-400 mt-2">
        + {formatNumber(lastValidCps)} coins/sec
      </p>
    </div>
  );
}
