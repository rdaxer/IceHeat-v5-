import React from 'react';
import {Composition} from 'remotion';
import {HeatCard, HeatCardProps} from './compositions/HeatCard';
import {Standings, StandingsProps} from './compositions/Standings';
import {IceHeatExport, standings} from './data/iceheat';
import sampleJson from './data/sample.json';

// Beispiel-/Standarddaten. Für eigene Rennen: diese Datei durch deinen
// IceHeat-JSON-Export ersetzen (src/data/sample.json) ODER per --props überschreiben.
const sample = sampleJson as unknown as IceHeatExport;

const FPS = 30;
const W = 1080; // 9:16 Hochformat für YouTube Shorts / Reels / TikTok
const H = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Heat-Ankündigung bzw. -Ergebnis (ein Heat) */}
      <Composition
        id="HeatCard"
        component={HeatCard}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{data: sample, heatIndex: 0}}
      />

      {/* Gesamtwertung / Ranking */}
      <Composition
        id="Standings"
        component={Standings}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{data: sample, topN: 10}}
        calculateMetadata={({props}) => {
          const rows = Math.min(props.topN ?? 10, standings(props.data).length);
          // Header + gestaffelte Zeilen + Halten am Ende
          const frames = 60 + rows * 9 + 90;
          return {durationInFrames: frames, fps: FPS, width: W, height: H};
        }}
      />
    </>
  );
};
