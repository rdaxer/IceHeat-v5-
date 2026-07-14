/* Inn Isar Racing — YouTube auto-feed
   Fetches the public RSS feed of the channel and writes data/videos.json.
   No API key required. Runs in GitHub Actions (open internet).
   Usage: node scripts/fetch-youtube.mjs
*/
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CHANNEL_ID = process.env.YT_CHANNEL_ID || 'UCIkUWT8IvWdasBUywWY22OA';
const MAX = 9;
const FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'data', 'videos.json');

function decode(s = '') {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}

function parse(xml) {
  const entries = xml.split('<entry>').slice(1);
  return entries.map((e) => {
    const id    = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || '';
    const title = decode((e.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
    const pub   = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    return {
      id,
      title,
      published: pub,
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  }).filter((v) => v.id).slice(0, MAX);
}

async function main() {
  const res = await fetch(FEED, { headers: { 'User-Agent': 'InnIsarRacingBot/1.0' } });
  if (!res.ok) throw new Error(`Feed HTTP ${res.status}`);
  const xml = await res.text();
  const videos = parse(xml);
  if (!videos.length) throw new Error('No videos parsed — feed format changed?');

  const payload = {
    channel: CHANNEL_ID,
    channelUrl: 'https://youtube.com/@innisarracingteam1753',
    updated: new Date().toISOString(),
    videos
  };
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${videos.length} videos -> data/videos.json`);
}

main().catch((err) => { console.error('fetch-youtube failed:', err.message); process.exit(1); });
