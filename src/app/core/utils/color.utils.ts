const PID_PALETTE = [
  '#60a5fa', // blue
  '#34d399', // emerald
  '#f59e0b', // amber
  '#a78bfa', // violet
  '#fb7185', // rose
  '#22d3ee', // cyan
  '#fb923c', // orange
  '#a3e635', // lime
  '#e879f9', // fuchsia
  '#4ade80', // green
  '#38bdf8', // sky
  '#f472b6', // pink
];

export function getPidColor(pid: number): string {
  return PID_PALETTE[(pid - 1) % PID_PALETTE.length];
}

/** Same color at reduced opacity — used for table row backgrounds. */
export function getPidColorAlpha(pid: number, alpha: number): string {
  const hex = getPidColor(pid).replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
