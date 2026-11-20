/** Semicircle gauge 300 to 900, drawn with a pathLength of 1 so it can animate. */
export function ScoreGauge({
  score,
  band,
  bandColor,
  draw = 'load',
  label,
  shown,
}: {
  score: number;
  band: string;
  bandColor: string;
  draw?: 'load' | 'scroll';
  label: string;
  shown?: number;
}) {
  const t = (Math.min(900, Math.max(300, score)) - 300) / 600;
  const ang = Math.PI * (1 - t);
  const x = (130 + 106 * Math.cos(ang)).toFixed(1);
  const y = (130 - 106 * Math.sin(ang)).toFixed(1);
  const id = `g${score}`;
  return (
    <svg role="img" aria-label={label} viewBox="0 0 260 160" className="h-auto w-full max-w-[360px]">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E5484D" />
          <stop offset=".45" stopColor="#F5A524" />
          <stop offset="1" stopColor="#0B6E4C" />
        </linearGradient>
      </defs>
      <path
        d="M24 130A106 106 0 0 1 236 130"
        fill="none"
        stroke="#EEF0F6"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        className={draw === 'load' ? 'a-draw' : 'draw-view'}
        pathLength={1}
        d={`M24 130A106 106 0 0 1 ${x} ${y}`}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="16"
        strokeLinecap="round"
      />
      <text
        x="130"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-bricolage), sans-serif"
        fontSize="54"
        fontWeight="800"
        fill="#121633"
        letterSpacing="-2"
      >
        {shown ?? score}
      </text>
      <text x="130" y="140" textAnchor="middle" fontSize="14" fontWeight="700" fill={bandColor}>
        {band}
      </text>
      <text x="24" y="156" textAnchor="middle" fontSize="11" fill="#6A7090">
        300
      </text>
      <text x="236" y="156" textAnchor="middle" fontSize="11" fill="#6A7090">
        900
      </text>
    </svg>
  );
}
