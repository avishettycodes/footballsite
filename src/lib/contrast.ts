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
/** Solid shapes with no text in them. WCAG's bar for a graphic that carries meaning. */
export const CONTRAST_GRAPHIC = 3;

/** The dark card every chart in this app is drawn on, `--color-turf-800`. */
const CARD = '#131a1e';

/**
 * @param min what the text at this size actually needs. Default is the small text
 *   standard; pass CONTRAST_LARGE_TEXT for display type.
 */
export function inkOn(hex: string, min: number = CONTRAST_SMALL_TEXT): string {
  const bg = luminance(hex);
  if (bg === null) return WHITE;

  const onWhite = ratio(luminance(WHITE)!, bg);
  if (onWhite >= min) return WHITE;

  const onBlack = ratio(luminance(DARK)!, bg);
  if (onBlack >= min) return DARK;

  // Unreachable for any real colour, since the worst case clears 4.58:1 on one side.
  return onWhite >= onBlack ? WHITE : DARK;
}

/**
 * A team colour you can actually SEE as a shape on the dark card.
 *
 * `inkOn` above solves the opposite problem, which is text sitting on a team colour. It
 * does not help a bar chart, because a bar has no text in it: the colour IS the mark, and
 * if the mark cannot be told apart from the card then the chart is a blank rectangle.
 *
 * That is not hypothetical. The season by season bars are coloured by whoever he was
 * playing for, and Chicago's navy measures 1.03:1 against this card. Denver's orange
 * looked great and the Bears would have rendered nothing at all, which is exactly the
 * shape of bug that got shipped once already: a team colour that was structurally
 * perfect, passed every overflow and clipping check, and could not be read.
 *
 * So the colour is walked toward white until it clears the graphic threshold. The hue
 * survives, which is the point of using the team's colour in the first place, and the
 * franchises that already clear it are returned untouched.
 */
function readsOnCard(hex: string, min: number): boolean {
  const card = luminance(CARD);
  const lum = luminance(hex);
  return card !== null && lum !== null && ratio(lum, card) >= min;
}

export function onDark(hex: string, min: number = CONTRAST_GRAPHIC): string {
  const card = luminance(CARD);
  if (card === null) return hex;

  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = Number.parseInt(full, 16);
  if (full.length !== 6 || !Number.isFinite(n)) return hex;
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];

  for (let step = 0; step <= 20; step++) {
    const mix = step / 20;
    const blended = rgb.map((v) => Math.round(v + (255 - v) * mix));
    const candidate = `#${blended.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    const lum = luminance(candidate);
    if (lum !== null && ratio(lum, card) >= min) return candidate;
  }
  return '#ffffff';
}

/**
 * WHICH OF A FRANCHISE'S TWO COLOURS TO DRAW A SHAPE IN, on the dark card.
 *
 * Lifting the primary works and it is the last resort rather than the first, because of
 * what it costs. Twenty two of the thirty two primaries fail on this background, and
 * most of the ones that fail are dark on purpose: Chicago navy, Raiders black, Seattle
 * college navy. Washing those toward white turns three different franchises into three
 * slightly different greys, which defeats the entire point of colouring the thing by
 * team.
 *
 * Every one of those clubs already owns a second colour that reads perfectly well, and
 * it is usually the one you picture anyway. Bears orange, Raiders silver, Packers gold.
 * So the secondary gets asked before anybody starts mixing in white, and the wash is
 * kept for the rare franchise whose whole palette is dark.
 */
export function teamMark(primary: string, secondary: string, min: number = CONTRAST_GRAPHIC): string {
  if (readsOnCard(primary, min)) return primary;
  if (readsOnCard(secondary, min)) return secondary;
  return onDark(primary, min);
}
