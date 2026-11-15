import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'battlefield');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Capturing high-resolution visual evidence for Professor...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(400);

    // Direct launch into active battlefield
    await page.evaluate(() => {
      if (window.__hearthlightBattle) {
        window.__hearthlightBattle.directLaunch();
        window.__hearthlightBattle.spawnBoardMinionsForTest();
        window.__hearthlightBattle.setPlayerMana(6, 6);
      }
    });
    await sleep(500);

    // Capture 1: Tabletop Arena Overview with Borderless Hand Fan, 3D Decks, Carved Mana Tray, Single Settings Cog
    const cap1Path = path.join(outDir, '01_tabletop_arena_overview.png');
    await page.screenshot({ path: cap1Path });
    console.log(`Saved: ${cap1Path}`);

    // Capture 2: Live Drag-and-Drop Minion Placement with Slot Parting
    const minionCard = await page.$('[data-testid="hand-card"][data-card-type="MINION"]');
    const dropzone = await page.$('[data-testid="player-board-dropzone"]');
    if (minionCard && dropzone) {
      const hBox = await minionCard.boundingBox();
      const dzBox = await dropzone.boundingBox();
      if (hBox && dzBox) {
        // Drag over dropzone
        await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
        await page.mouse.down();
        await sleep(150);
        // Move to first slot
        await page.mouse.move(dzBox.x + dzBox.width * 0.35, dzBox.y + dzBox.height / 2);
        await sleep(300);

        const cap2Path = path.join(outDir, '02_drag_minion_slot_parting.png');
        await page.screenshot({ path: cap2Path });
        console.log(`Saved: ${cap2Path}`);

        // Drop the minion to summon it
        await page.mouse.up();
        await sleep(500);
      }
    }

    // Capture 3: Borderless Minions on Board (Emerald glow, Taunt, Zzz) + Targeting Arrow
    const playerPower = await page.$('[data-testid="player-hero-power"]');
    const opponentHero = await page.$('[data-testid="opponent-hero"]');
    if (playerPower && opponentHero) {
      const pBox = await playerPower.boundingBox();
      const oBox = await opponentHero.boundingBox();
      if (pBox && oBox) {
        const startX = pBox.x + pBox.width / 2;
        const startY = pBox.y + pBox.height / 2;
        const targetX = oBox.x + oBox.width / 2;
        const targetY = oBox.y + oBox.height / 2;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await sleep(100);
        await page.mouse.move((startX + targetX) / 2 + 60, (startY + targetY) / 2);
        await sleep(250);

        const cap3Path = path.join(outDir, '03_targeting_arrow_and_board_minions.png');
        await page.screenshot({ path: cap3Path });
        console.log(`Saved: ${cap3Path}`);

        await page.mouse.up();
        await sleep(300);
      }
    }

    // Capture 4: Authentic Braided Hemp Rope with Ember Tip + History Rail Hover Preview
    await page.evaluate(() => {
      if (window.__hearthlightBattle) {
        window.__hearthlightBattle.triggerRopeNow();
      }
    });
    await sleep(250);

    const historyItem = await page.$('[data-testid="history-item"]');
    if (historyItem) {
      const hiBox = await historyItem.boundingBox();
      if (hiBox) {
        await page.mouse.move(hiBox.x + hiBox.width / 2, hiBox.y + hiBox.height / 2);
        await sleep(300);
      }
    }

    const cap4Path = path.join(outDir, '04_braided_rope_and_history_preview.png');
    await page.screenshot({ path: cap4Path });
    console.log(`Saved: ${cap4Path}`);

    // Capture 5: Mobile Landscape (667x375) Layout Containment
    const mobilePage = await browser.newPage({ viewport: { width: 667, height: 375 } });
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.evaluate(() => {
      if (window.__hearthlightBattle) {
        window.__hearthlightBattle.directLaunch();
        window.__hearthlightBattle.spawnBoardMinionsForTest();
      }
    });
    await sleep(400);

    const cap5Path = path.join(outDir, '05_mobile_landscape_containment.png');
    await mobilePage.screenshot({ path: cap5Path });
    console.log(`Saved: ${cap5Path}`);
  } finally {
    await browser.close();
  }
}

capture().catch(console.error);
