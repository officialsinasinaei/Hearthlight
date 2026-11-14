import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const outDir = path.join(root, 'screenshots', 'collection');
const compDir = path.join(outDir, 'compressed');
const sheetsDir = path.join(outDir, 'sheets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
if (!fs.existsSync(compDir)) fs.mkdirSync(compDir, { recursive: true });
if (!fs.existsSync(sheetsDir)) fs.mkdirSync(sheetsDir, { recursive: true });

const tmpDir = path.join(root, '.chrome-test-profile');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=1920,1080',
  '--user-data-dir=' + tmpDir,
  '--disable-gpu',
  'http://localhost:5173/',
]);

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let ws;
let msgId = 1;
const callbacks = new Map();

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = msgId++;
    callbacks.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const res = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error(JSON.stringify(res.exceptionDetails));
  }
  return res.result?.value;
}

async function capture(fileName) {
  const filePath = path.join(outDir, fileName);
  const res = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(res.data, 'base64');
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      fs.writeFileSync(filePath, buf);
      console.log(`[CAPTURE SUCCESS] -> ${filePath}`);
      return;
    } catch (err) {
      if (attempt === 4) throw err;
      await sleep(600);
    }
  }
}

async function main() {
  try {
    let target = null;
    for (let i = 0; i < 20; i++) {
      await sleep(300);
      try {
        const res = await fetch('http://127.0.0.1:9222/json');
        const list = await res.json();
        target = list.find((t) => t.type === 'page' && t.url.includes('5173'));
        if (target) break;
      } catch (e) {}
    }

    if (!target) throw new Error('Could not find 5173 page target in Chrome');

    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('Input.setIgnoreInputEvents', { ignore: false });
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      mobile: false,
    });

    async function waitForCardImages(timeoutMs = 15000) {
      console.log('Waiting for card images to settle...');
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const resolved = await evaluate(`
          (() => {
            const cards = Array.from(document.querySelectorAll('[data-testid="collection-card"]'));
            if (cards.length === 0) return false;
            const imgs = cards.map(c => c.querySelector('img')).filter(Boolean);
            if (imgs.length < cards.length) return false;
            return imgs.every(img => img.complete && img.naturalWidth > 0);
          })()
        `);
        if (resolved) {
          console.log(`All card images resolved in ${Date.now() - start}ms`);
          await sleep(600);
          return true;
        }
        await sleep(300);
      }
      console.warn('Timed out waiting for card images to resolve');
      return false;
    }

    console.log('Waiting for initial load...');
    await sleep(2000);

    // FLOW 1: Navigate to Collection -> 01_collection_browse.png
    console.log('Navigating from Main Menu to Collection...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const colBtn = buttons.find(b => b.textContent && b.textContent.includes('My Collection'));
        if (colBtn) colBtn.click();
      })()
    `);
    await sleep(1500);
    await waitForCardImages();

    console.log('Capturing 01_collection_browse.png...');
    await capture('01_collection_browse.png');

    // FLOW 2: Sticky Mana Filter (Mana 3) -> 02_mana_filter_and_search.png
    console.log('Activating Mana 3 crystal (22 matching Mage cards)...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const mana3 = buttons.find(b => b.getAttribute('aria-label') === 'Filter by 3 Mana');
        if (mana3) mana3.click();
      })()
    `);
    await sleep(1000);
    await waitForCardImages();

    console.log('Capturing 02_mana_filter_and_search.png...');
    await capture('02_mana_filter_and_search.png');

    // Reset filters
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const allMana = buttons.find(b => b.getAttribute('aria-label') === 'Filter by ALL Mana');
        if (allMana) allMana.click();
      })()
    `);
    await sleep(1000);

    // FLOW 3: Hero Select Screen with Warning Toast -> 03_hero_select_toast.png
    console.log('Opening Hero Select View and clicking locked hero for toast...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newDeckBtn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('new deck'));
        if (newDeckBtn) newDeckBtn.click();
      })()
    `);
    await sleep(2500);

    // Click locked Warrior hero to trigger toast & shake
    await evaluate(`
      (() => {
        const tile = document.querySelector('[data-testid="hero-tile-warrior"]');
        if (tile) tile.click();
      })()
    `);
    await sleep(400);

    console.log('Capturing 03_hero_select_toast.png...');
    await capture('03_hero_select_toast.png');
    await sleep(1500);

    // Close Hero Select by clicking Back
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const backBtn = buttons.find(b => b.textContent && b.textContent.trim().toUpperCase() === 'BACK');
        if (backBtn) backBtn.click();
      })()
    `);
    await sleep(800);

    // FLOW 4: Card Inspect Modal in Browse Mode -> 04_card_inspect_browse.png
    console.log('Opening Card Inspect Modal in Browse mode...');
    await evaluate(`
      (() => {
        const firstCard = document.querySelector('[data-testid="collection-card"]');
        if (firstCard) firstCard.click();
      })()
    `);
    await sleep(1500);

    console.log('Capturing 04_card_inspect_browse.png...');
    await capture('04_card_inspect_browse.png');

    // Close inspect modal
    await evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('✕'));
        if (closeBtn) closeBtn.click();
        else {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) dialog.click();
        }
      })()
    `);
    await sleep(800);

    // FLOW 5: Open Hero Select -> Choose Jaina -> Build Deck demonstrating Deck Limit: 2 and Deck Limit: 1 ★
    console.log('Entering Deck Editor with a custom deck showing copy limit plaques...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const newDeckBtn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('new deck'));
        if (newDeckBtn) newDeckBtn.click();
      })()
    `);
    await sleep(1500);

    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const chooseBtn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('choose'));
        if (chooseBtn) chooseBtn.click();
      })()
    `);
    await sleep(1500);

    // Add 2 copies of card 0 (Cold Snap -> DECK LIMIT: 2)
    // Add 1 copy of card 7 (The Forbidden Sequence, Legendary -> DECK LIMIT: 1 ★)
    // Add 1 copy of card 1 (First Flame -> + Add (1/2))
    console.log('Adding 2 copies of Cold Snap, 1 copy of Forbidden Sequence (Legendary), 1 copy of First Flame...');
    await evaluate(`
      (() => {
        const cards = document.querySelectorAll('[data-testid="collection-card"]');
        if (cards[0]) {
          const addBtn = cards[0].querySelector('button');
          if (addBtn) { addBtn.click(); addBtn.click(); }
        }
        if (cards[7]) {
          const addBtn = cards[7].querySelector('button');
          if (addBtn) addBtn.click();
        }
        if (cards[1]) {
          const addBtn = cards[1].querySelector('button');
          if (addBtn) addBtn.click();
        }
      })()
    `);
    await sleep(1500);

    // Assert that deck editor title and counter are fully visible within viewport (rect.top >= 0)
    const headerBbox = await evaluate(`
      (() => {
        const titleEl = document.querySelector('[data-testid="deck-editor-title"]');
        const countEl = document.querySelector('[data-testid="deck-card-count"]');
        if (!titleEl || !countEl) return { error: 'elements not found' };
        const tRect = titleEl.getBoundingClientRect();
        const cRect = countEl.getBoundingClientRect();
        return {
          title: { top: tRect.top, bottom: tRect.bottom, height: tRect.height },
          count: { top: cRect.top, bottom: cRect.bottom, height: cRect.height },
          viewportHeight: window.innerHeight
        };
      })()
    `);
    console.log('Flow 5 Deck Editor Header Bounding Box:', JSON.stringify(headerBbox));
    if (!headerBbox || headerBbox.error) {
      throw new Error(`Sidebar header elements missing: ${headerBbox?.error}`);
    }
    if (headerBbox.title.top < 0 || headerBbox.count.top < 0) {
      throw new Error(`Sidebar header clipped! title.top=${headerBbox.title.top}, count.top=${headerBbox.count.top}`);
    }

    console.log('Capturing 05_deck_editor.png...');
    await capture('05_deck_editor.png');

    // FLOW 6: Click a card in Deck-Building mode to open Inspect Modal with Add/Remove buttons -> 06_card_inspect_deck_builder.png
    console.log('Opening Card Inspect Modal in Deck-Building mode on Cold Snap...');
    await evaluate(`
      (() => {
        const firstCard = document.querySelector('[data-testid="collection-card"]');
        if (firstCard) firstCard.click();
      })()
    `);
    await sleep(1500);

    console.log('Capturing 06_card_inspect_deck_builder.png...');
    await capture('06_card_inspect_deck_builder.png');

    // Close inspect modal
    await evaluate(`
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('✕'));
        if (closeBtn) closeBtn.click();
        else {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) dialog.click();
        }
      })()
    `);
    await sleep(800);

    // FLOW 7: Click "Done" on incomplete deck (4/30 cards) to trigger Confirmation Modal -> 07_incomplete_deck_modal.png
    console.log('Clicking Done to trigger Incomplete Deck Confirmation Modal...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const doneBtn = buttons.find(b => b.textContent && b.textContent.trim().toUpperCase() === 'DONE');
        if (doneBtn) doneBtn.click();
      })()
    `);
    await sleep(1000);

    console.log('Capturing 07_incomplete_deck_modal.png...');
    await capture('07_incomplete_deck_modal.png');

    // FLOW 8: Click "Save as Incomplete" in modal -> My Decks drawer with Active Deck + Incomplete Deck -> 08_active_deck_in_my_decks.png
    console.log('Saving as incomplete and capturing My Decks drawer...');
    await evaluate(`
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const saveIncompleteBtn = buttons.find(b => b.textContent && b.textContent.includes('Save as Incomplete'));
        if (saveIncompleteBtn) saveIncompleteBtn.click();
      })()
    `);
    await sleep(1500);

    console.log('Capturing 08_active_deck_in_my_decks.png...');
    await capture('08_active_deck_in_my_decks.png');

    console.log('All 8 verification flows captured successfully!');
  } finally {
    if (ws) ws.close();
    chrome.kill();
    await sleep(800);
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {}

    // Compress all 8 PNGs into fast-uploading JPEGs and build composite sheets
    console.log('Compressing all captured screenshots to JPEG and building composite sheets...');
    execSync('python scripts/build-sheets.py', { cwd: root, stdio: 'inherit' });
    console.log('Capture and sheet generation complete!');
  }
}

main().catch((err) => {
  console.error('Fatal capture error:', err);
  process.exit(1);
});
