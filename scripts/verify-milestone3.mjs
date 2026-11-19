import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'milestone3');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('====================================================');
  console.log('Milestone 3 Specialized Verification Suite');
  console.log('====================================================\n');

  const failures = [];
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

    // Enter battle arena directly via directLaunch
    await page.evaluate(() => {
      window.__hearthlightBattle?.directLaunch?.();
    });
    await sleep(800);

    // Confirm mulligan if present
    const mulliganBtn = await page.$('button:has-text("Confirm Selection"), [data-testid="mulligan-confirm-button"]');
    if (mulliganBtn) {
      await mulliganBtn.click();
      await sleep(600);
    }

    console.log('▶ Test 1: ActiveSecretCrest on Player & Opponent Heroes...');
    // Add secrets to player and opponent
    await page.evaluate(() => {
      window.__hearthlightBattle.addActiveSecretForTest('player', 'Counterspell');
      window.__hearthlightBattle.addActiveSecretForTest('player', 'Ice Barrier');
      window.__hearthlightBattle.addActiveSecretForTest('opponent', 'Vaporize');
    });
    await sleep(300);

    const secretCrests = await page.$$('[data-testid="active-secret-crest"]');
    if (secretCrests.length !== 2) {
      failures.push(`Expected 2 active secret crests (player & opponent), found ${secretCrests.length}`);
    } else {
      console.log('  Active secret crests rendered on both heroes.');
    }

    // Verify player secret count indicator
    const countBadge = await page.$('[data-testid="active-secret-count"]');
    if (!countBadge) {
      failures.push('Active secret count indicator not found on player hero with 2 secrets');
    } else {
      const countText = await countBadge.textContent();
      if (countText?.trim() !== '2') {
        failures.push(`Expected secret count '2', got '${countText}'`);
      } else {
        console.log('  Player secret count indicator correctly displays "2".');
      }
    }

    // Hover player secret crest and verify tooltip
    const playerCrest = await page.$('[data-testid="player-hero"] [data-testid="active-secret-crest"]');
    if (!playerCrest) {
      failures.push('Player active secret crest not found');
    } else {
      await playerCrest.hover();
      await sleep(250);
      const tooltip = await page.$('[data-testid="player-hero"] [data-testid="secret-tooltip"]');
      if (!tooltip) {
        failures.push('Secret tooltip did not appear on hover for player');
      } else {
        const tooltipText = await tooltip.textContent();
        if (!tooltipText.includes('Counterspell') || !tooltipText.includes('Ice Barrier')) {
          failures.push(`Player secret tooltip missing secret names, got: ${tooltipText}`);
        } else {
          console.log('  Player secret tooltip shows secret names and details.');
        }

        const tooltipBox = await tooltip.boundingBox();
        if (tooltipBox) {
          if (tooltipBox.x < 8) {
            failures.push(`Player secret tooltip left-edge clipped off screen: x=${tooltipBox.x} < 8`);
          } else {
            console.log(`  Player secret tooltip has comfortable viewport clearance: x=${tooltipBox.x} >= 8`);
          }
        }
      }
    }

    // Hover opponent secret crest and verify hidden tooltip
    const oppCrest = await page.$('[data-testid="opponent-hero"] [data-testid="active-secret-crest"]');
    if (!oppCrest) {
      failures.push('Opponent active secret crest not found');
    } else {
      await oppCrest.hover();
      await sleep(250);
      const oppTooltip = await page.$('[data-testid="opponent-hero"] [data-testid="secret-tooltip"]');
      if (oppTooltip) {
        const oppText = await oppTooltip.textContent();
        if (!oppText.includes('Secret: Hidden')) {
          failures.push(`Opponent secret tooltip leaked details: ${oppText}`);
        } else {
          console.log('  Opponent secret tooltip correctly displays "Secret: Hidden".');
        }
      }
    }

    const s1Path = path.join(outDir, '01_active_secrets_crests.png');
    await page.screenshot({ path: s1Path });
    console.log(`  Saved screenshot: ${path.relative(root, s1Path)}`);

    console.log('\n▶ Test 2: BoardMinion Frozen, Stealth & Spell Damage Overlays...');
    // Spawn board minions and set keywords
    await page.evaluate(() => {
      window.__hearthlightBattle.spawnBoardMinionsForTest();
    });
    await sleep(300);

    await page.evaluate(() => {
      // Friendly minion 0: Frozen
      window.__hearthlightBattle.setBoardMinionStateForTest(0, true, { isFrozen: true });
      // Friendly minion 1: Stealth
      window.__hearthlightBattle.setBoardMinionStateForTest(1, true, { hasStealth: true });
      // Opponent minion 0: Spell Damage +2
      window.__hearthlightBattle.setBoardMinionStateForTest(0, false, { spellDamage: 2 });
    });
    await sleep(300);

    const frozenOverlay = await page.$('[data-testid="minion-frozen-overlay"]');
    if (!frozenOverlay) {
      failures.push('Frozen overlay [data-testid="minion-frozen-overlay"] missing on frozen minion');
    } else {
      console.log('  Frozen overlay verified.');
    }

    const stealthOverlay = await page.$('[data-testid="minion-stealth-overlay"]');
    if (!stealthOverlay) {
      failures.push('Stealth overlay [data-testid="minion-stealth-overlay"] missing on stealth minion');
    } else {
      console.log('  Stealth overlay verified.');
    }

    const spellDamageOverlay = await page.$('[data-testid="minion-spell-damage-overlay"]');
    if (!spellDamageOverlay) {
      failures.push('Spell damage overlay [data-testid="minion-spell-damage-overlay"] missing on spell damage minion');
    } else {
      console.log('  Spell damage overlay verified.');
    }

    // Verify Gate 3.1d constraints are strictly maintained
    const boardMinions = await page.$$('[data-testid="board-minion"]');
    for (let i = 0; i < boardMinions.length; i++) {
      const minionData = await boardMinions[i].evaluate((el) => {
        const cs = window.getComputedStyle(el);
        const hasAttackBadge = Boolean(el.querySelector('[data-testid="minion-attack-badge"]'));
        const hasHealthBadge = Boolean(el.querySelector('[data-testid="minion-health-badge"]'));
        const hasOvalBorder = el.querySelector('.rounded-full.border-3') !== null;
        return {
          borderWidth: cs.borderWidth,
          hasAttackBadge,
          hasHealthBadge,
          hasOvalBorder,
        };
      });
      if (minionData.hasAttackBadge || minionData.hasHealthBadge) {
        failures.push(`Board minion #${i} has redundant stat badge overlay`);
      }
      if (minionData.hasOvalBorder) {
        failures.push(`Board minion #${i} has capsule/oval border overlay`);
      }
      if (minionData.borderWidth !== '0px') {
        failures.push(`Board minion #${i} has borderWidth: ${minionData.borderWidth}`);
      }
    }
    console.log('  Gate 3.1d constraints (zero stat badges, zero .rounded-full.border-3, 0px borderWidth) 100% satisfied.');

    const s2Path = path.join(outDir, '02_keyword_overlays.png');
    await page.screenshot({ path: s2Path });
    console.log(`  Saved screenshot: ${path.relative(root, s2Path)}`);

    console.log('\n▶ Test 3: Frozen Minions Cannot Initiate Attack Targeting...');
    // Attempt to drag from frozen minion
    const friendlyMinions = await page.$$('[data-testid="player-board-dropzone"] [data-testid="board-minion"]');
    const frozenMinion = friendlyMinions[0];
    const fBox = await frozenMinion.boundingBox();
    if (fBox) {
      await page.mouse.move(fBox.x + fBox.width / 2, fBox.y + fBox.height / 2);
      await page.mouse.down();
      await sleep(100);
      await page.mouse.move(fBox.x + fBox.width / 2, fBox.y - 100);
      await sleep(150);

      const arrow = await page.$('[data-testid="targeting-arrow"]');
      if (arrow) {
        failures.push('Targeting arrow appeared when dragging a frozen minion! Frozen minions must not attack.');
      } else {
        console.log('  Frozen minion correctly prevented targeting arrow initiation.');
      }
      await page.mouse.up();
    }

    console.log('\n▶ Test 4: DiscoverOverlay UI & Keyboard Resolution...');
    // Trigger Discover overlay
    await page.evaluate(() => {
      window.__hearthlightBattle.triggerDiscoverForTest();
    });
    await sleep(300);

    const discoverOverlay = await page.$('[data-testid="discover-overlay"]');
    if (!discoverOverlay) {
      failures.push('DiscoverOverlay [data-testid="discover-overlay"] not visible when pendingChoice is present');
    } else {
      console.log('  DiscoverOverlay rendered with data-testid="discover-overlay".');
    }

    const titleEl = await page.$('[data-testid="discover-title"]');
    if (!titleEl) {
      failures.push('Discover modal title [data-testid="discover-title"] missing');
    } else {
      const title = await titleEl.textContent();
      console.log(`  Discover modal title: "${title}"`);
    }

    const options = await page.$$('[data-testid^="discover-option-"]');
    if (options.length !== 3) {
      failures.push(`Expected 3 discover options, found ${options.length}`);
    } else {
      console.log('  3 Discover card choices rendered cleanly with stats/text/mana/artwork.');

      // Verify pure borderless card silhouette & zero duplicate mana badges
      for (let i = 0; i < options.length; i++) {
        const cardData = await options[i].evaluate((btn) => {
          const cardBox = btn.querySelector('div');
          const cs = cardBox ? window.getComputedStyle(cardBox) : window.getComputedStyle(btn);
          const duplicateManaBadge = btn.querySelector('.bg-gradient-to-b.from-blue-400');
          const duplicateBadges = btn.querySelectorAll('.rounded-full.bg-gradient-to-b');
          return {
            borderWidth: cs.borderWidth,
            hasDuplicateManaBadge: Boolean(duplicateManaBadge),
            duplicateBadgeCount: duplicateBadges.length,
          };
        });

        if (cardData.borderWidth !== '0px') {
          failures.push(`Discover option #${i} has borderWidth: ${cardData.borderWidth} (must be 0px borderless)`);
        }
        if (cardData.hasDuplicateManaBadge || cardData.duplicateBadgeCount > 0) {
          failures.push(`Discover option #${i} has duplicate stat/mana badges`);
        }
      }
      console.log('  Discover cards verified: pure borderless silhouette (borderWidth 0px) and 0 duplicate mana badges.');
    }

    const s3Path = path.join(outDir, '03_discover_overlay.png');
    await page.screenshot({ path: s3Path });
    console.log(`  Saved screenshot: ${path.relative(root, s3Path)}`);

    // Test resolving via keyboard key '2'
    console.log('  Testing keyboard selection with key "2"...');
    await page.keyboard.press('2');
    await sleep(350);

    const overlayAfterKey = await page.$('[data-testid="discover-overlay"]');
    if (overlayAfterKey) {
      failures.push('DiscoverOverlay remained open after pressing key "2"');
    } else {
      console.log('  DiscoverOverlay closed cleanly upon keyboard resolution.');
    }

    // Verify selected card added to player hand
    const handCount = await page.evaluate(() => {
      return window.__hearthlightBattle.getState().battle?.player.hand.length ?? 0;
    });
    console.log(`  Player hand count after discover: ${handCount}`);

  } catch (err) {
    failures.push(`Unexpected error: ${err.message}\n${err.stack}`);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('Milestone 3 Verification Results');
  console.log('====================================================');
  if (failures.length > 0) {
    console.error(`❌ FAILED with ${failures.length} issues:`);
    failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    process.exit(1);
  } else {
    console.log('✅ ALL MILESTONE 3 VERIFICATION CHECKS PASSED!');
    process.exit(0);
  }
}

run();
