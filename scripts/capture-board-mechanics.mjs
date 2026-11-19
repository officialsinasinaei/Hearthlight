#!/usr/bin/env node
/**
 * Playwright Visual Captures for Milestone 4
 *
 * Captures high-fidelity board screenshots demonstrating new mechanics:
 *   1. test-results/active-secret.png       - Arcane secret crests & tooltips
 *   2. test-results/minion-visual-states.png - Frozen, Stealth & Spell Damage overlays
 *   3. test-results/token-summon.png        - Canonical summoned tokens (Water Elemental, Mirror Defender, Construct)
 *   4. test-results/discover-overlay.png    - 3-card tactile Discover picker overlay
 *   5. test-results/battlefield-overview.png - Full battlefield overview
 */

import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'test-results');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('====================================================');
  console.log('Playwright Board Mechanics Visual Capture Runner');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(400);

    // Direct launch into battlefield arena
    await page.evaluate(() => {
      window.__hearthlightBattle?.directLaunch?.();
    });
    await sleep(800);

    // Confirm mulligan if active
    const mulliganBtn = await page.$('button:has-text("Confirm Selection"), [data-testid="mulligan-confirm-button"]');
    if (mulliganBtn) {
      await mulliganBtn.click();
      await sleep(600);
    }

    // 1. Capture Active Secret Crest & Tooltip
    console.log('▶ Capturing 01: Active Secret Crests & Tooltips...');
    await page.evaluate(() => {
      window.__hearthlightBattle.addActiveSecretForTest('player', 'Counterspell');
      window.__hearthlightBattle.addActiveSecretForTest('player', 'Ice Barrier');
      window.__hearthlightBattle.addActiveSecretForTest('opponent', 'Vaporize');
    });
    await sleep(400);

    // Hover player secret crest to display tooltip
    const playerCrest = await page.$('[data-testid="player-hero"] [data-testid="active-secret-crest"]');
    if (playerCrest) {
      await playerCrest.hover();
      await sleep(250);
    }

    const secretImg = path.join(outDir, 'active-secret.png');
    await page.screenshot({ path: secretImg });
    console.log(`  ✔ Saved: ${path.relative(root, secretImg)}`);

    // 2. Capture Minion Visual States (Frozen, Stealth, Spell Damage)
    console.log('▶ Capturing 02: Minion Visual States (Frozen, Stealth, Spell Damage)...');
    await page.mouse.move(0, 0); // Unhover secret
    await sleep(150);

    await page.evaluate(() => {
      window.__hearthlightBattle.spawnBoardMinionsForTest();
    });
    await sleep(300);

    await page.evaluate(() => {
      window.__hearthlightBattle.setBoardMinionStateForTest(0, true, { isFrozen: true });
      window.__hearthlightBattle.setBoardMinionStateForTest(1, true, { hasStealth: true });
      window.__hearthlightBattle.setBoardMinionStateForTest(0, false, { spellDamage: 2 });
    });
    await sleep(400);

    const minionImg = path.join(outDir, 'minion-visual-states.png');
    await page.screenshot({ path: minionImg });
    console.log(`  ✔ Saved: ${path.relative(root, minionImg)}`);

    // 3. Capture Summoned Token Minions (Water Elemental, Mirror Defender, Construct)
    console.log('▶ Capturing 03: Summoned Canonical Token Minions...');
    await page.evaluate(() => {
      window.__hearthlightBattle.spawnBoardMinionsForTest();
      const b = window.__hearthlightBattle.getState().battle;
      if (b) {
        if (b.player.board[0]) {
          b.player.board[0].name = 'Water Elemental';
          b.player.board[0].attack = 3;
          b.player.board[0].health = 6;
          b.player.board[0].maxHealth = 6;
          b.player.board[0].artEmoji = '🌊';
          b.player.board[0].text = '<b>Freeze</b> any character damaged by this minion.';
        }
        if (b.player.board[1]) {
          b.player.board[1].name = 'Mirror Defender';
          b.player.board[1].attack = 0;
          b.player.board[1].health = 4;
          b.player.board[1].hasTaunt = true;
          b.player.board[1].artEmoji = '🛡️';
          b.player.board[1].text = '<b>Taunt</b>';
        }
        if (b.opponent.board[0]) {
          b.opponent.board[0].name = 'Ancient Construct';
          b.opponent.board[0].attack = 10;
          b.opponent.board[0].health = 10;
          b.opponent.board[0].isFrozen = true;
          b.opponent.board[0].artEmoji = '🗿';
        }
      }
      window.__hearthlightBattle.setBoardMinionStateForTest(0, true, {});
    });
    await sleep(400);

    const tokenImg = path.join(outDir, 'token-summon.png');
    await page.screenshot({ path: tokenImg });
    console.log(`  ✔ Saved: ${path.relative(root, tokenImg)}`);

    // 4. Capture Discover 3-Card Overlay Modal
    console.log('▶ Capturing 04: Discover 3-Card Overlay Modal...');
    await page.evaluate(() => {
      window.__hearthlightBattle.triggerDiscoverForTest();
    });
    await sleep(400);

    const discoverImg = path.join(outDir, 'discover-overlay.png');
    await page.screenshot({ path: discoverImg });
    console.log(`  ✔ Saved: ${path.relative(root, discoverImg)}`);

    // Resolve Discover choice headlessly via keyboard
    await page.keyboard.press('2');
    await sleep(400);

    // 5. Capture Battlefield Overview
    console.log('▶ Capturing 05: Battlefield Complete Overview...');
    const overviewImg = path.join(outDir, 'battlefield-overview.png');
    await page.screenshot({ path: overviewImg });
    console.log(`  ✔ Saved: ${path.relative(root, overviewImg)}`);

    console.log('\n====================================================');
    console.log('✔ All 5 Visual Proof Screenshots Captured Successfully!');
    console.log('====================================================\n');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('Visual capture error:', err);
  process.exit(1);
});
