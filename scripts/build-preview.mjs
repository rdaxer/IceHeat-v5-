/* Build a single self-contained preview (for a claude.ai Artifact) from the
   real site: inline CSS + JS, embed sponsor logos as data URIs, replace the
   external YouTube live iframe with a placeholder. Output: preview.html
   (artifact body format: <style> + content + <script>, no html/head/body). */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rd = (p) => readFile(path.join(root, p), 'utf8');
const b64 = async (p, mime) => `data:${mime};base64,${Buffer.from(await readFile(path.join(root, p))).toString('base64')}`;

const [css, hero, main, indexHtml] = await Promise.all([
  rd('assets/css/style.css'), rd('assets/js/hero.js'), rd('assets/js/main.js'), rd('index.html')
]);

const kugelmann = await b64('assets/img/sponsors/kugelmann.webp', 'image/webp');
const gromann = await b64('assets/img/sponsors/gromann.png', 'image/png');

// body inner
let body = indexHtml.slice(indexHtml.indexOf('<body>') + 6, indexHtml.indexOf('</body>'));

// drop script includes (we inline hero+main below; skip content.js/fetch)
body = body.replace(/\s*<script src="[^"]*"><\/script>/g, '');

// subpage links won't exist in a single-file preview -> scroll to section
body = body.replace(/fahrer\.html#[a-z-]+/g, '#fahrer').replace(/fahrer\.html/g, '#fahrer');

// replace the live iframe with a styled placeholder (external embeds are CSP-blocked)
body = body.replace(/<div class="live-frame">[\s\S]*?<\/div>/,
  `<div class="live-frame" style="display:grid;place-items:center;text-align:center;padding:24px;">
     <div style="color:var(--text-dim)"><div style="font-size:2.4rem;color:var(--red)">▶</div>
     <strong style="font-family:var(--font-display);letter-spacing:1px;text-transform:uppercase">Live-Player</strong><br>
     <span style="font-size:.9rem">Erscheint automatisch während einer Übertragung (Restream → YouTube).<br>In der Vorschau deaktiviert.</span></div>
   </div>`);

// replace sponsor placeholders with the real logos we have
body = body.replace(/<div class="sponsors reveal" id="sponsors-list">[\s\S]*?<\/div>\s*<\/div>/,
  `<div class="sponsors reveal" id="sponsors-list">
        <div class="sponsor" title="Kugelmann Maschinenbau"><img src="${kugelmann}" alt="Kugelmann"></div>
        <div class="sponsor" title="Jörg Grohmann Versicherungsmakler"><img src="${gromann}" alt="Grohmann"></div>
        <div class="sponsor" style="color:var(--text-mute)">+ weitere</div>
      </div>
    </div>`);

// small preview note under hero badge
body = body.replace('<span class="hero-badge">',
  '<span class="hero-badge" title="Vorschau">');

const out = `<style>\n${css}\n</style>\n${body}\n<script>\n${hero}\n</script>\n<script>\n${main}\n</script>\n`;
await writeFile(path.join(root, 'preview.html'), out, 'utf8');
console.log('Built preview.html (' + out.length + ' bytes)');
