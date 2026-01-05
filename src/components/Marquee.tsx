export default function Marquee() {
  const text =
    "Strategy → Identity → Digital → Motion → Interaction → Direction → Leadership → Delivery → ";

  return (
    <div className="w-full overflow-hidden bg-[var(--marquee-bg)] text-[var(--marquee-text)] py-2">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="text-xs uppercase tracking-wide mx-4">{text}</span>
        <span className="text-xs uppercase tracking-wide mx-4">{text}</span>
        <span className="text-xs uppercase tracking-wide mx-4">{text}</span>
        <span className="text-xs uppercase tracking-wide mx-4">{text}</span>
      </div>
    </div>
  );
}
