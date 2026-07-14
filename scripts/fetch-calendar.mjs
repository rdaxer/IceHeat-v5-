/* Inn Isar Racing — Google-Kalender-Sync
   Fetches the PUBLIC iCal feed of the club calendar and writes data/events.json.
   The Google Calendar is the single source of truth; edit dates there (also on
   mobile) and the website updates automatically on the next Action run.
   Runs in GitHub Actions (open internet). No API key required.
*/
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CAL_ID = process.env.CAL_ID ||
  'c85316707e0d0ebbd69c12525428113663d38ccb078380cfe40a8559f0dedc9f@group.calendar.google.com';
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CAL_ID)}/public/basic.ics`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, '..', 'data', 'events.json');

function unfold(ics) {
  // RFC5545 line unfolding: continuation lines start with space/tab
  return ics.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
}
function unescape(s = '') {
  return s.replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}
function toDate(val) {
  // val like 20260802T140000 (local/TZID) or 20260802T120000Z or 20260925 (date)
  const m = val.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh, mm] = m;
  return { date: `${y}-${mo}-${d}`, time: hh ? `${hh}:${mm}` : '', dateOnly: !hh };
}

function parse(ics) {
  const blocks = unfold(ics).split('BEGIN:VEVENT').slice(1);
  const events = [];
  for (const b of blocks) {
    const body = b.split('END:VEVENT')[0];
    const get = (key) => {
      const re = new RegExp(`(?:^|\\n)${key}(?:;[^:\\n]*)?:([^\\n]*)`);
      const mm = body.match(re);
      return mm ? mm[1].trim() : '';
    };
    const dtRaw = get('DTSTART');
    const dt = toDate(dtRaw);
    if (!dt) continue;
    const summary = unescape(get('SUMMARY'));
    const location = unescape(get('LOCATION'));
    const description = unescape(get('DESCRIPTION'));

    // team / type / status hints from description ("Team: devils | Typ: home")
    let team = /devils/i.test(summary + description) ? 'devils' : 'team';
    const tMatch = description.match(/Team:\s*(devils|team)/i);
    if (tMatch) team = tMatch[1].toLowerCase();

    let type = 'away';
    const typMatch = description.match(/Typ:\s*(home|away|preview)/i);
    if (typMatch) type = typMatch[1].toLowerCase();
    else if (/landshut|onesolar/i.test(location)) type = 'home';

    const status = /vorl(ä|ae)ufig|provisional/i.test(description) ? 'provisional' : 'confirmed';

    events.push({
      date: dt.date,
      time: dt.time,
      title: summary,
      subtitle: '',
      location,
      team,
      type,
      status
    });
  }
  events.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return events;
}

async function main() {
  let ics;
  try {
    const res = await fetch(ICS_URL, { headers: { 'User-Agent': 'InnIsarRacingBot/1.0' } });
    if (!res.ok) throw new Error(`ICS HTTP ${res.status}`);
    ics = await res.text();
  } catch (err) {
    console.warn('Calendar fetch failed, keeping existing events.json:', err.message);
    process.exit(0); // don't break the pipeline on transient outages
  }
  const events = parse(ics);
  const payload = {
    _comment: 'AUTO-GENERIERT aus dem oeffentlichen Google-Kalender. Nicht manuell editieren — Termine im Google-Kalender pflegen.',
    calendarId: CAL_ID,
    updated: new Date().toISOString(),
    events
  };
  await writeFile(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${events.length} events -> data/events.json`);
}

main().catch((err) => { console.error('fetch-calendar failed:', err.message); process.exit(1); });
