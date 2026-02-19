export default function Pill({ label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85">
      <span className="text-white/50">{label}</span>
      <span className="font-semibold tracking-tight">{value}</span>
    </div>
  );
}
