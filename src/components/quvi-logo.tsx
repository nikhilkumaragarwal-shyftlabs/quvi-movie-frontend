type QuviMarkProps = {
  size?: number;
  className?: string;
};

/** Marquee-frame Q mark — signature Quvi brand element. */
export function QuviMark({ size = 32, className = "" }: QuviMarkProps) {
  return (
    <span
      aria-hidden
      className={`quvi-marquee inline-flex shrink-0 select-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="quvi-marquee-dot quvi-marquee-dot-tl" />
      <span className="quvi-marquee-dot quvi-marquee-dot-tr" />
      <span className="quvi-marquee-dot quvi-marquee-dot-bl" />
      <span className="quvi-marquee-dot quvi-marquee-dot-br" />
      <span className="quvi-marquee-dot quvi-marquee-dot-mt" />
      <span className="quvi-marquee-dot quvi-marquee-dot-mb" />
      <span className="quvi-marquee-dot quvi-marquee-dot-ml" />
      <span className="quvi-marquee-dot quvi-marquee-dot-mr" />
      <span
        className="font-display font-black leading-none text-foreground"
        style={{ fontSize: size * 0.58 }}
      >
        Q
      </span>
    </span>
  );
}

type QuviLogoProps = {
  showWordmark?: boolean;
  markSize?: number;
  className?: string;
};

export function QuviLogo({
  showWordmark = true,
  markSize = 34,
  className = "",
}: QuviLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <QuviMark size={markSize} />
      {showWordmark && (
        <span className="font-display text-2xl font-black tracking-tight text-foreground">
          Quvi
        </span>
      )}
    </span>
  );
}
