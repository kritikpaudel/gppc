export default function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white",
        "placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/15",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
