/**
 * Black or white ink, whichever is actually readable on a team colour.
 *
 * Team badges were hardcoded to white text, which is fine for 30 franchises and
 * unreadable for two: New Orleans is #d3bc8d and Pittsburgh is #ffb612, and white on
 * either lands around 1.8:1. That was survivable while the badges only rendered above
 * the sm breakpoint, on a screen wide enough to also show the player's name beside
 * them. The career summary puts them on a phone, on their own, so they have to be
 * legible on their own.
 *
 * Standard WCAG relative luminance, picking whichever ink wins the contrast ratio.
 */
export function inkOn(hex: string): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = Number.parseInt(full, 16);
  if (full.length !== 6 || !Number.isFinite(n)) return '#ffffff';

  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];

  const onWhite = 1.05 / (luminance + 0.05);
  const onBlack = (luminance + 0.05) / 0.05;
  return onWhite >= onBlack ? '#ffffff' : '#07090c';
}
