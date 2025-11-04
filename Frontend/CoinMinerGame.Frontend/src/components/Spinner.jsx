export default function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border border-cyan-400/30"></div>
        <div className="absolute inset-1 rounded-full border border-cyan-400/40 animate-[spin_1.6s_linear_infinite] border-t-transparent"></div>
        <div className="absolute inset-2 rounded-full bg-cyan-400/20 blur-md"></div>
      </div>
    </div>
  );
}
