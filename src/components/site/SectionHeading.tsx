export default function SectionHeading({
  eyebrow,
  title,
  text,
  dark = false,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  text?: string;
  dark?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div>
      {eyebrow && <p className={`eyebrow ${dark ? "text-brand" : "text-brand-dark"}`}>{eyebrow}</p>}
      <Tag className={`display mt-2 text-[2.6rem] sm:text-5xl lg:text-[3.6rem] ${dark ? "text-white" : "text-ink"}`}>{title}</Tag>
      {text && <p className={`mt-3 max-w-2xl text-lg ${dark ? "text-white/85" : "text-ink/80"}`}>{text}</p>}
    </div>
  );
}
