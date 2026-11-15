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

async function run() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  try {
    // Mobile Landscape (667x375)
    console.log('Capturing mobile landscape...');
    const pageML = await browser.newPage({ viewport: { width: 667, height: 375 } });
    await pageML.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await pageML.evaluate(() => localStorage.clear());
    await pageML.reload({ waitUntil: 'networkidle' });
    await sleep(300);

    const playBtn = await pageML.$('button[aria-label="Enter Play Arena"]');
    if (playBtn) {
      await playBtn.click();
      await pageML.waitForSelector('[data-testid="mulligan-confirm-button"]', { timeout: 10000 });
      await sleep(500);
      const conf = await pageML.$('[data-testid="mulligan-confirm-button"]');
      if (conf) await conf.click();
      await pageML.waitForSelector('[data-testid="battlefield-screen"]', { timeout: 6000 });
      await pageML.evaluate(() => {
        if (window.__hearthlightBattle) {
          window.__hearthlightBattle.spawnBoardMinionsForTest();
        }
      });
      await sleep(400);

      const mlPath = path.join(outDir, '06_mobile_landscape_active_board.png');
      await pageML.screenshot({ path: mlPath });
      console.log(`Saved: ${mlPath}`);
    }

    // Portrait 90-degree rotated (393x852)
    console.log('Capturing portrait rotated...');
    const pageP = await browser.newPage({ viewport: { width: 393, height: 852 } });
    await pageP.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await sleep(300);
    const playBtnP = await pageP.$('button[aria-label="Enter Play Arena"]');
    if (playBtnP) {
      await playBtnP.click();
      await pageP.waitForSelector('[data-testid="mulligan-confirm-button"]', { timeout: 10000 });
      await sleep(500);
      const conf = await pageP.$('[data-testid="mulligan-confirm-button"]');
      if (conf) await conf.click();
      await pageP.waitForSelector('[data-testid="battlefield-screen"]', { timeout: 6000 });
      await pageP.evaluate(() => {
        if (window.__hearthlightBattle) {
          window.__hearthlightBattle.spawnBoardMinionsForTest();
        }
      });
      await sleep(400);

      const pPath = path.join(outDir, '07_portrait_auto_landscape_active_board.png');
      await pageP.screenshot({ path: pPath });
      console.log(`Saved: ${pPath}`);
    }
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
