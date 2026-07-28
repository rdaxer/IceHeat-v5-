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
  GATE_BG,
  GATE_DE,
  GATE_FG,
  GATE_LBL,
  getFlag,
  getNat,
  heatHasResults,
  heatLines,
  IceHeatExport,
  scoreLabel,
} from '../data/iceheat';

export type HeatCardProps = {
  data: IceHeatExport;
  heatIndex: number;
};

const FONT_HEAD = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Barlow', system-ui, sans-serif";

export const HeatCard: React.FC<HeatCardProps> = ({data, heatIndex}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  const heat = data.heats[heatIndex] ?? data.heats[0];
  const lines = heat ? heatLines(data, heat) : [];
  const done = heat ? heatHasResults(heat) : false;

  // Kopfbereich fährt von oben ein
  const headY = interpolate(
    spring({frame, fps, config: {damping: 200}}),
    [0, 1],
    [-80, 0]
  );
  const headOpacity = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});

  // Große HEAT-Nummer
  const badge = spring({frame: frame - 6, fps, config: {damping: 12, mass: 0.8}});

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #14243a 0%, #0b1220 55%, #070b14 100%)',
        fontFamily: FONT_BODY,
        color: '#e8eefc',
        padding: '90px 64px',
      }}
    >
      {/* Eis-Struktur / dezente Linien */}
      <AbsoluteFill style={{opacity: 0.06, backgroundImage:
        'repeating-linear-gradient(115deg, #7fb6ff 0 2px, transparent 2px 60px)'}} />

      {/* Header */}
      <div style={{transform: `translateY(${headY}px)`, opacity: headOpacity, textAlign: 'center'}}>
        <div style={{
          fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 46, letterSpacing: 2,
          color: '#38bdf8', textTransform: 'uppercase',
        }}>
          {data.eventName}
        </div>
        <div style={{fontSize: 30, color: '#8ba0c4', marginTop: 4}}>{data.eventSub}</div>
      </div>

      {/* HEAT-Badge */}
      <div style={{textAlign: 'center', margin: '38px 0 30px'}}>
        <div style={{
          display: 'inline-block',
          transform: `scale(${badge})`,
          fontFamily: FONT_HEAD, fontWeight: 900, letterSpacing: 4,
          fontSize: 120, lineHeight: 1,
          color: '#fff',
          textShadow: '0 0 40px rgba(56,189,248,.55)',
        }}>
          HEAT {heat?.id ?? heatIndex + 1}
        </div>
        <div style={{
          fontFamily: FONT_HEAD, fontSize: 34, letterSpacing: 6, marginTop: 6,
          color: done ? '#fbbf24' : '#7fb6ff', textTransform: 'uppercase', fontWeight: 700,
        }}>
          {done ? 'Ergebnis' : 'Aufstellung'}
        </div>
      </div>

      {/* Fahrer-Zeilen */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 22}}>
        {lines.map((ln, i) => {
          const appear = spring({frame: frame - 18 - i * 8, fps, config: {damping: 18}});
          const x = interpolate(appear, [0, 1], [width, 0]);
          const bg = GATE_BG[ln.gate];
          const fg = GATE_FG[ln.gate];

          return (
            <div
              key={i}
              style={{
                transform: `translateX(${x}px)`,
                opacity: appear,
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.08)',
                borderLeft: `10px solid ${bg}`,
                borderRadius: 18,
                padding: '18px 22px',
                minHeight: 128,
              }}
            >
              {/* Gatter-Kreis mit Helmfarbe */}
              <div style={{
                width: 84, height: 84, borderRadius: '50%', flexShrink: 0,
                background: bg, color: fg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 46,
                boxShadow: `0 0 24px ${bg}66`,
              }}>
                {ln.gate + 1}
              </div>

              {/* Foto oder Startnummer-Platzhalter */}
              <div style={{
                width: 88, height: 112, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                background: '#0f1729', border: `2px solid ${bg}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {ln.driver?.photo ? (
                  <Img src={ln.driver.photo} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center'}} />
                ) : (
                  <span style={{fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 40, color: 'rgba(255,255,255,.22)'}}>
                    {ln.driver?.nr || '?'}
                  </span>
                )}
              </div>

              {/* Name + Nation */}
              <div style={{flex: 1, minWidth: 0}}>
                <div style={{fontSize: 22, color: '#8ba0c4', fontWeight: 700}}>
                  #{ln.driver?.nr || '—'} · {GATE_DE[ln.gate]} · {GATE_LBL[ln.gate]}
                </div>
                <div style={{
                  fontFamily: FONT_HEAD, fontWeight: 800, fontSize: 42, lineHeight: 1.05,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {ln.driver?.name || '— kein Fahrer —'}
                </div>
                <div style={{fontSize: 26, color: '#a9bade', marginTop: 2}}>
                  {getFlag(ln.driver?.nation || '')} {getNat(ln.driver?.nation || '')}
                </div>
              </div>

              {/* Ergebnis-Badge (nur wenn gefahren) */}
              {done && (
                <div style={{
                  flexShrink: 0, textAlign: 'center', minWidth: 96,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}>
                  <div style={{
                    fontFamily: FONT_HEAD, fontWeight: 900, fontSize: 52,
                    color: ln.points === 3 ? '#fbbf24' : ln.points === 2 ? '#cbd5e1' : ln.points === 1 ? '#d97706' : '#e8eefc',
                  }}>
                    {scoreLabel(ln.result)}
                  </div>
                  <div style={{fontSize: 22, color: '#8ba0c4', fontWeight: 700}}>
                    {ln.points === null ? '—' : `${ln.points} PKT`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
