import { chromium } from 'playwright-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const url = 'file://' + path.join(root, process.argv[2] || 'index.html');
const out = process.argv[3] || 'scratch-shot.png';
const width = parseInt(process.argv[4] || '1440', 10);

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
// force final reveal state so full-page capture shows all sections
await page.evaluate(() => document.querySelectorAll('.reveal').forEach(e => e.classList.add('in')));
await page.waitForTimeout(700);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('shot ->', out);
