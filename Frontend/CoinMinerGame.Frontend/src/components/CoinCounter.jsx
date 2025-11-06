import { useEffect, useState } from "react";

export default function CoinCounter({
  coins,
  baseCps,
  effectiveCps,
  passiveBoost,
}) {
  const sanitize = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };

  const [displayBaseCps, setDisplayBaseCps] = useState(() => sanitize(baseCps));
  const [displayEffectiveCps, setDisplayEffectiveCps] = useState(() =>
    sanitize(effectiveCps, sanitize(baseCps))
  );

  useEffect(() => {
    setDisplayBaseCps((prev) => sanitize(baseCps, prev));
  }, [baseCps]);

  useEffect(() => {
    setDisplayEffectiveCps((prev) => sanitize(effectiveCps, prev));
  }, [effectiveCps]);

  const formatNumber = (num) =>
    num.toLocaleString("en-US", { maximumFractionDigits: 0 });

  const boostActive =
    passiveBoost &&
    passiveBoost.remainingSeconds > 0 &&
    passiveBoost.multiplier > 1 &&
    displayEffectiveCps > displayBaseCps;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-300/20 bg-slate-950/70 p-6 text-center shadow-[0_12px_35px_rgba(8,47,73,0.45)]">
      <div className="absolute -top-12 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">
        Vault Balance
      </p>
      <h2 className="mt-4 text-5xl font-semibold text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.35)]">
        {formatNumber(coins)}
      </h2>
      <div className="mt-4 flex flex-col items-center gap-1 text-sm text-slate-300/80">
        <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200">
          +{formatNumber(displayEffectiveCps)} coins/sec
        </span>
        {boostActive ? (
          <span className="text-xs text-emerald-300">
            Passive boost x{passiveBoost.multiplier} ·{" "}
            {passiveBoost.remainingSeconds}s left
          </span>
        ) : (
          <span className="text-xs text-slate-500">Passive boost inactive</span>
        )}
      </div>
    </div>
  );
}
