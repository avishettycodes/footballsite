import { ATTRIBUTE_SETS, getTeam } from '../data';
import type { Player } from '../data';
import { AttributeBar } from './AttributeBar';

export function PlayerCard({ player }: { player: Player }) {
  const team = getTeam(player.teamId);
  const keys = ATTRIBUTE_SETS[player.position];
  const peak = Math.max(...keys.map((k) => player.attributes[k] ?? 0));

  return (
    <article className="group relative overflow-hidden rounded-lg border border-white/10 bg-turf-800 transition-colors hover:border-white/25">
      <div className="h-1 w-full" style={{ backgroundColor: team.primary }} />
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg leading-tight tracking-tight uppercase">
            {player.name}
          </h3>
          <p className="font-mono text-[11px] tracking-wide text-white/40">
            {team.abbr} · {player.years}
          </p>
        </div>
        <div
          className="shrink-0 rounded px-2 py-1 text-center font-mono text-[10px] leading-none font-bold"
          style={{ backgroundColor: team.secondary, color: '#07090c' }}
        >
          <div className="text-base leading-none">{peak}</div>
          <div className="mt-0.5 opacity-70">PEAK</div>
        </div>
      </div>
      <p className="px-4 pt-2 text-[13px] leading-snug text-white/60 italic">{player.blurb}</p>
      <div className="mt-3 space-y-1.5 border-t border-white/8 px-4 py-3">
        {keys.map((key) => (
          <AttributeBar key={key} attribute={key} value={player.attributes[key] ?? 0} />
        ))}
      </div>
    </article>
  );
}
