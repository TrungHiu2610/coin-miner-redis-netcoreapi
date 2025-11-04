export default function Card({ title, children, className = "" }) {
  return (
    <div className={`holo-card ${className}`}>
      <div className="holo-card__inner">
        <div className="border-b border-cyan-400/10 bg-slate-900/60 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
          {title}
        </div>
        <div className="flex-grow p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
