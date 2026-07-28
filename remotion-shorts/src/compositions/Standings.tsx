import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  getFlag,
  getNat,
  IceHeatExport,
  standings,
} from '../data/iceheat';

export type StandingsProps = {
  data: IceHeatExport;
  topN: number;
};

const FONT_HEAD = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Barlow', system-ui, sans-serif";

const MEDAL = ['#fbbf24', '#cbd5e1', '#d97706']; // Gold / Silber / Bronze

export const Standings: React.FC<StandingsProps> = ({data, topN}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const rows = standings(data).slice(0, topN);
  const maxTotal = Math.max(1, ...rows.map((r) => r.total));

  const headY = interpolate(spring({frame, fps, config: {damping: 200}}), [0, 1], [-70, 0]);
  const headOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #14243a 0%, #0b1220 55%, #070b14 100%)',
        fontFamily: FONT_BODY,
        color: '#e8eefc',
        padding: '90px 60px',
      }}
    >
      <AbsoluteFill style={{opacity: 0.06, backgroundImage:
        'repeating-linear-gradient(115deg, #7fb6ff 0 2px, transparent 2px 60px)'}} />

      {/* Header */}
      <div style={{transform: `translateY(${headY}px)`, opacity: headOpacity, textAlign: 'center', marginBottom: 34}}>
        <div style={{
          fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 92, letterSpacing: 3,
          color: '#fff', textShadow: '0 0 34px rgba(56,189,248,.5)', lineHeight: 1,
        }}>
          GESAMTWERTUNG
        </div>
        <div style={{fontSize: 34, color: '#38bdf8', fontWeight: 700, marginTop: 8}}>
          {data.eventName}
        </div>
        <div style={{fontSize: 26, color: '#8ba0c4'}}>{data.eventSub}</div>
      </div>

      {/* Ranking-Zeilen */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {rows.map((r, i) => {
          const appear = spring({frame: frame - 24 - i * 9, fps, config: {damping: 20}});
          const x = interpolate(appear, [0, 1], [-width, 0]);

          // Balkenbreite proportional zu Punkten
          const barGrow = spring({frame: frame - 34 - i * 9, fps, config: {damping: 22}});
          const barPct = (r.total / maxTotal) * 100 * barGrow;

          // Punkte hochzählen
          const count = Math.round(r.total * interpolate(
            spring({frame: frame - 34 - i * 9, fps, config: {damping: 22}}),
            [0, 1], [0, 1]
          ));

          const medal = i < 3 ? MEDAL[i] : null;

          return (
            <div
              key={r.driver.id}
              style={{
                transform: `translateX(${x}px)`,
                opacity: appear,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                background: 'rgba(255,255,255,.04)',
                border: `1px solid ${medal ? medal + '66' : 'rgba(255,255,255,.08)'}`,
                borderRadius: 16,
                padding: '14px 20px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Punkte-Balken im Hintergrund */}
              <div style={{
                position: 'absolute', inset: 0,
                width: `${barPct}%`,
                background: `linear-gradient(90deg, ${(medal || '#38bdf8')}33, ${(medal || '#38bdf8')}08)`,
              }} />

              {/* Rang */}
              <div style={{
                position: 'relative', width: 70, textAlign: 'center', flexShrink: 0,
                fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 58,
                color: medal || '#5f7196',
              }}>
                {i + 1}
              </div>

              {/* Foto / Nummer */}
              <div style={{
                position: 'relative', width: 66, height: 84, borderRadius: 8, overflow: 'hidden',
                flexShrink: 0, background: '#0f1729', border: '2px solid rgba(255,255,255,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {r.driver.photo ? (
                  <Img src={r.driver.photo} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center'}} />
                ) : (
                  <span style={{fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 30, color: 'rgba(255,255,255,.22)'}}>
                    {r.driver.nr}
                  </span>
                )}
              </div>

              {/* Name + Nation */}
              <div style={{position: 'relative', flex: 1, minWidth: 0}}>
                <div style={{
                  fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 40, lineHeight: 1.05,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {r.driver.name}
                </div>
                <div style={{fontSize: 24, color: '#a9bade', marginTop: 2}}>
                  #{r.driver.nr} · {getFlag(r.driver.nation)} {getNat(r.driver.nation)} · {r.heats} Heats
                </div>
              </div>

              {/* Punkte */}
              <div style={{position: 'relative', textAlign: 'right', flexShrink: 0, minWidth: 120}}>
                <span style={{
                  fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 62,
                  color: medal || '#fff',
                }}>
                  {count}
                </span>
                <span style={{fontSize: 24, color: '#8ba0c4', marginLeft: 6, fontWeight: 700}}>PKT</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
