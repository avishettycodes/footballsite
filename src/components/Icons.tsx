/**
 * Hand-drawn SVG icons, drawn here rather than pulled from an icon set or an emoji font.
 *
 * WHY NOT EMOJI. Every trophy used to be one, and emoji are somebody else's artwork.
 * Apple, Google and Microsoft each draw them differently, they carry a glossy 3D style
 * that fights everything else on the screen, and a football, a crown and a scroll sitting
 * in a row is the visual signature of something assembled rather than designed. They also
 * cannot take a colour: an emoji ignores the yellow it is sitting next to.
 *
 * WHY NOT IMAGE FILES EITHER. A PNG needs a size decision, a retina variant, a loading
 * state and a second copy for the dark ground it sits on. These are one colour each and
 * inherit it from CSS through `currentColor`, so a trophy in the case is gold and the
 * same trophy in the missed list is grey without a second asset existing.
 *
 * They are drawn on a 24 unit grid, at a stroke weight that survives being rendered at
 * 14px in a hall row and at 40px in a trophy case.
 */

type Props = { className?: string; title?: string };

const box = (className?: string) => ({
  viewBox: '0 0 24 24',
  className: className ?? 'h-6 w-6',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

/**
 * A pigskin, laces and all. Currently UNUSED: it was the Pro Bowl trophy, and the Pro
 * Bowl was deleted for firing on nearly every run. Kept because it is a drawn asset that
 * costs nothing to leave in the map and a future award may want a football.
 */
export function Football({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M3.6 20.4c-1.5-5 .3-11.4 4.2-15.3S17.4 1.1 20.4 3.6c2.5 3 1.6 8.7-1.5 12.6s-10.3 5.7-15.3 4.2Z" />
      <path d="M8.4 15.6 15.6 8.4" />
      <path d="m10.5 12.9 1.4 1.4M12.9 10.5l1.4 1.4M12.3 8.7l3 3" />
      <path d="M4.2 19.8 6.6 17.4M17.4 6.6l2.4-2.4" />
    </svg>
  );
}

/** First-team All-Pro. */
export function Star({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="m12 2.8 2.7 5.9 6.5.8-4.8 4.4 1.3 6.3L12 17l-5.7 3.2 1.3-6.3-4.8-4.4 6.5-.8Z" />
    </svg>
  );
}

/**
 * Offensive Player of the Year. A helmet seen head on.
 *
 * The first attempt drew one in profile, which is the more interesting drawing and the
 * wrong one. In profile the dome, the jaw and the facemask all become one continuous
 * curve, and at 24px that is a hook rather than a helmet. Head on it is a dome, a centre
 * stripe and two bars, and there is nothing else it could be.
 */
export function Helmet({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M4.6 14.4a7.4 7.4 0 0 1 14.8 0v1.8H4.6Z" />
      <path d="M12 7v7.4" />
      <path d="M5.4 16.2v2.6M18.6 16.2v2.6" />
      <path d="M5.4 18.8h13.2M7.2 21.2h9.6" />
    </svg>
  );
}

/** MVP. A cup, not a crown, because nobody hands out crowns in this sport. */
export function Trophy({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M7.4 3.6h9.2v5.1a4.6 4.6 0 0 1-9.2 0Z" />
      <path d="M7.4 5.1H5.1a2.3 2.3 0 0 0 2.3 4.1M16.6 5.1h2.3a2.3 2.3 0 0 1-2.3 4.1" />
      <path d="M12 13.3v3.4M8.6 20.4h6.8l-.9-3.7H9.5Z" />
    </svg>
  );
}

/** The record. A stopwatch, since every record here is really a longevity record. */
export function Stopwatch({ className }: Props) {
  return (
    <svg {...box(className)}>
      <circle cx="12" cy="13.7" r="7.4" />
      <path d="M12 9.9v3.8l2.4 2.4M9.7 2.8h4.6M12 2.8v3.5M18.6 7.3l1.6-1.6" />
    </svg>
  );
}

/** The Super Bowl. A ring with a stone on it. */
export function Ring({ className }: Props) {
  return (
    <svg {...box(className)}>
      <circle cx="12" cy="15.1" r="5.4" />
      <path d="m8.6 8.4 3.4-3.9 3.4 3.9M9.4 4.5h5.2" />
      <path d="m8.6 8.4 3.4 2.6 3.4-2.6" />
    </svg>
  );
}

/**
 * No ring. The WHOLE ring, struck through, rather than a broken arc.
 *
 * The first attempt drew a partial arc with a line across it, on the theory that a
 * broken ring says "no ring". At 44px it read as a squiggle, because you cannot
 * recognise a shape you have never been shown intact. Drawing the complete ring and
 * putting a slash over it means you see what he did not get, which is the actual
 * sentence this icon is carrying.
 */
export function RingBroken({ className }: Props) {
  return (
    <svg {...box(className)}>
      <circle cx="12" cy="15.1" r="5.4" />
      <path d="m8.6 8.4 3.4-3.9 3.4 3.9M9.4 4.5h5.2" />
      <path d="M4.3 4.3 19.7 20.4" />
    </svg>
  );
}

/**
 * Hall of Fame. The hall itself, columns and steps.
 *
 * This was a laurel wreath first, which is a lovely idea and unreadable small. Two
 * symmetrical sprays of leaves at 24px look like antennae, so the icon read as an
 * insect sitting in the trophy case. A building with columns is duller and says
 * "hall" the instant you see it, which is the whole job.
 */
export function Laurel({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M3.2 9.6 12 4l8.8 5.6" />
      <path d="M8.4 12v5.6M12 12v5.6M15.6 12v5.6" />
      <path d="M4.8 12v5.6M19.2 12v5.6" />
      <path d="M3.4 17.6h17.2M2.8 20.4h18.4" />
    </svg>
  );
}

export function SoundOn({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M11 4.8 6.4 8.6H3.6v6.8h2.8L11 19.2Z" />
      <path d="M14.8 9.4a3.7 3.7 0 0 1 0 5.2M17.6 6.6a7.6 7.6 0 0 1 0 10.8" />
    </svg>
  );
}

export function SoundOff({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M11 4.8 6.4 8.6H3.6v6.8h2.8L11 19.2Z" />
      <path d="m15.2 9.8 5 4.4M20.2 9.8l-5 4.4" />
    </svg>
  );
}

export function Close({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />
    </svg>
  );
}

/** Elite trait and soft spot markers on a player card. Filled, so they read at 9px. */
export function CaretUp({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'h-3 w-3'} fill="currentColor" aria-hidden>
      <path d="M12 6.5 20 17.5H4Z" />
    </svg>
  );
}

export function CaretDown({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'h-3 w-3'} fill="currentColor" aria-hidden>
      <path d="M12 17.5 4 6.5h16Z" />
    </svg>
  );
}

export function Chevron({ className }: Props) {
  return (
    <svg {...box(className)}>
      <path d="m7.6 9.8 4.4 4.4 4.4-4.4" />
    </svg>
  );
}

/**
 * The accolade icons, keyed by the id the scoring engine hands out. Scoring owns which
 * trophies exist; this owns what they look like.
 */
export const TROPHY_ICONS = {
  football: Football,
  star: Star,
  helmet: Helmet,
  trophy: Trophy,
  stopwatch: Stopwatch,
  ring: Ring,
  laurel: Laurel,
} as const;

export type TrophyIconId = keyof typeof TROPHY_ICONS;

export function TrophyIcon({ id, className }: { id: string; className?: string }) {
  const Component = TROPHY_ICONS[id as TrophyIconId] ?? Star;
  return <Component className={className} />;
}
