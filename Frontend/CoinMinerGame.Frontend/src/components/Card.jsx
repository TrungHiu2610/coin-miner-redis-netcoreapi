export default function Card({ title, children, className = "" }) {
  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg h-full flex flex-col ${className}`}
    >
      <h3 className="text-xl font-bold text-center p-4 border-b border-slate-700 bg-slate-900/30 rounded-t-xl">
        {title}
      </h3>
      <div className="p-4 flex-grow">{children}</div>
    </div>
  );
}
