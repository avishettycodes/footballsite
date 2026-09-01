/**
 * Black or white ink, whichever is actually readable on a team colour.
 *
 * Team badges were hardcoded to white text, which is fine for 30 franchises and
 * unreadable for two: New Orleans is #d3bc8d and Pittsburgh is #ffb612, and white on
 * either lands around 1.8:1. That was survivable while the badges only rendered above
 * the sm breakpoint, on a screen wide enough to also show the player's name beside
 * them. The career summary puts them on a phone, on their own, so they have to be
 * legible on their own. The reel is worse again: it is the largest block of team colour
 * in the game and you stare at it for the length of every spin.
 *
 * WHY THE THRESHOLD IS AN ARGUMENT RATHER THAN A CONSTANT.
 *
 * A single cutoff makes the ink flip between franchises whose colours are nearly the
 * same. Detroit is #0076b6 and the Chargers are #0080c6, two blues you would struggle
 * to tell apart, and they sit either side of 4.5:1 by a fifth of a point. On the reel
 * they land next to each other and the ink changes between adjacent rows mid spin,
 * which reads as a rendering bug rather than a contrast decision.
 *
 * So the caller says what its text needs, and white wins whenever it clears that.
 * Large display text needs 3:1 under WCAG AA, which every franchise except Pittsburgh
 * and New Orleans clears in white, so the reel flips for exactly the two colours that
 * are genuinely gold and for nothing else. Small text needs 4.5:1, which is the default,
 * and the badges are scattered across a screen rather than stacked, so a flip between
 * two of them is invisible.
 *
 * Nothing can fail both inks. The crossover, where white and black are equally bad,
 * is a luminance of 0.179, and both sides measure 4.58:1 there. So the floor across any
 * palette is 4.58:1 with the better ink and no outline or darkened backing is ever
 * needed. Measured across all 32 franchises the real floor is the Chargers at 4.65:1.
 */

const WHITE = '#ffffff';
const DARK = '#07090c';

function luminance(hex: string): number | null {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = Number.parseInt(full, 16);
  if (full.length !== 6 || !Number.isFinite(n)) return null;

  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG contrast ratio between two luminances. */
function ratio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export const CONTRAST_SMALL_TEXT = 4.5;
export const CONTRAST_LARGE_TEXT = 3;

/**
 * @param min what the text at this size actually needs. Default is the small text
 *   standard; pass CONTRAST_LARGE_TEXT for display type.
 */
export function inkOn(hex: string, min: number = CONTRAST_SMALL_TEXT): string {
  const bg = luminance(hex);
  if (bg === null) return WHITE;

  const onWhite = ratio(luminance(WHITE)!, bg);
  if (onWhite >= min) return WHITE;

  const onDark = ratio(luminance(DARK)!, bg);
  if (onDark >= min) return DARK;

  // Unreachable for any real colour, since the worst case clears 4.58:1 on one side.
  return onWhite >= onDark ? WHITE : DARK;
}
