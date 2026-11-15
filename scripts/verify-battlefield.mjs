import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'battlefield');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('====================================================');
  console.log('Hearthlight Battlefield Verification Harness');
  console.log('====================================================\n');

  const failures = [];

  // Gate 1: Check Required Source Files
  console.log('▶ Gate 1: Checking Required Source Files...');
  const requiredFiles = [
    path.join(root, 'src', 'components', 'battlefield', 'BattlefieldScreen.tsx'),
    path.join(root, 'src', 'components', 'battlefield', 'MulliganOverlay.tsx'),
    path.join(root, 'src', 'components', 'battlefield', 'TargetingArrowOverlay.tsx'),
    path.join(root, 'src', 'components', 'battlefield', 'MatchResultModal.tsx'),
    path.join(root, 'src', 'engine', 'battleEngine.ts'),
    path.join(root, 'src', 'engine', 'cardEffects.ts'),
    path.join(root, 'src', 'store', 'useBattleStore.ts'),
  ];

  for (const f of requiredFiles) {
    if (!fs.existsSync(f)) {
      failures.push(`Required file missing: ${path.relative(root, f)}`);
    }
  }

  // Gate 2: Card Effect Coverage across all 96 Mage Cards + The Coin
  console.log('\n▶ Gate 2: Checking Card Effect Engine Coverage...');
  try {
    const rawMageCards = JSON.parse(
      fs.readFileSync(path.join(root, 'src', 'engine', 'mage-cards.json'), 'utf8')
    );
    if (!Array.isArray(rawMageCards) || rawMageCards.length < 90) {
      failures.push(`Expected at least 90 mage cards, found ${rawMageCards?.length}`);
    } else {
      console.log(`  Loaded ${rawMageCards.length} Mage cards for effect verification.`);
    }

    if (fs.existsSync(path.join(root, 'src', 'engine', 'cardEffects.ts'))) {
      const { resolveCardEffect } = await import('../src/engine/cardEffects.ts');
      let covered = 0;
      for (const card of rawMageCards) {
        const eff = resolveCardEffect(card);
        if (eff) covered++;
      }
      console.log(`  Effect resolver covered: ${covered}/${rawMageCards.length} cards`);
      if (covered < rawMageCards.length) {
        failures.push(`Incomplete card effect coverage: ${covered}/${rawMageCards.length} resolved`);
      }
    }
  } catch (err) {
    failures.push(`Gate 2 exception: ${err.message}`);
  }

  // Gate 3: Playwright End-to-End Verification
  console.log('\n▶ Gate 3: Playwright End-to-End Battlefield Verification...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  try {
    // 3.1: Desktop 1440x900
    console.log('  Testing Desktop Viewport (1440x900)...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(400);

    // Click Play to trigger matchmaking
    const playBtn = await page.$('button[aria-label="Enter Play Arena"]');
    if (!playBtn) {
      failures.push('Play button not found on Main Menu');
    } else {
      await playBtn.click();
      console.log('  Play clicked. Waiting for matchmaking lock and transition to battlefield...');

      // Wait for Mulligan overlay to appear (matchmaking takes ~3.5s + 1.5s lock)
      const mulliganOverlay = await page.waitForSelector('[data-testid="mulligan-overlay"]', {
        timeout: 10000,
      }).catch(() => null);

      if (!mulliganOverlay) {
        failures.push('Mulligan overlay did not appear after matchmaking');
      } else {
        console.log('  Mulligan overlay displayed successfully!');
        // Check mulligan cards
        const mulliganCards = await page.$$('[data-testid="mulligan-card"]');
        if (mulliganCards.length < 3) {
          failures.push(`Expected at least 3 mulligan cards, found ${mulliganCards.length}`);
        } else {
          // Toggle first card to replace
          await mulliganCards[0].click();
          await sleep(250);
          const replaceX = await page.$('[data-testid="mulligan-replace-x"]');
          if (!replaceX) {
            failures.push('Mulligan replace red X did not appear upon clicking card');
          }

          // Screenshot 1: Mulligan Screen
          const s1Path = path.join(outDir, '01_mulligan_screen.png');
          await page.screenshot({ path: s1Path });
          console.log(`  Saved screenshot: ${path.relative(root, s1Path)}`);

          // Click Confirm button
          const confirmBtn = await page.$('[data-testid="mulligan-confirm-button"]');
          if (!confirmBtn) {
            failures.push('Mulligan confirm button not found');
          } else {
            await confirmBtn.click();
            await sleep(800);
          }
        }

        // Verify Battlefield Screen
        const battlefield = await page.waitForSelector('[data-testid="battlefield-screen"]', {
          timeout: 6000,
        }).catch(() => null);

        if (!battlefield) {
          failures.push('Battlefield screen did not render after confirming mulligan');
        } else {
          console.log('  Battlefield screen active!');

          // Check essential battlefield elements
          const playerHero = await page.$('[data-testid="player-hero"]');
          const opponentHero = await page.$('[data-testid="opponent-hero"]');
          const playerPower = await page.$('[data-testid="player-hero-power"]');
          const manaTray = await page.$('[data-testid="mana-crystal-tray"]');
          const endTurnBtn = await page.$('[data-testid="end-turn-button"]');
          const historyRail = await page.$('[data-testid="history-rail"]');

          if (!playerHero) failures.push('Player hero portrait not found');
          if (!opponentHero) failures.push('Opponent hero portrait not found');
          if (!playerPower) failures.push('Player Fireblast Hero Power dial not found');
          if (!manaTray) failures.push('Mana crystal tray not found');
          if (!endTurnBtn) failures.push('End turn button not found');
          if (!historyRail) failures.push('Combat action history rail not found');

          // Gate 3.1a: Check Single Settings Button in Bottom-Right
          console.log('  Checking Settings button placement (strictly single bottom-right)...');
          const allMenuButtons = await page.$$('[data-testid="battle-menu-button"], [data-testid="battlefield-menu-button"]');
          // Deduplicate by handle if any elements have both testids
          const uniqueMenuButtons = [];
          for (const btn of allMenuButtons) {
            const isSame = await Promise.all(uniqueMenuButtons.map(async (u) => page.evaluate(([a, b]) => a === b, [u, btn])));
            if (!isSame.some(Boolean)) uniqueMenuButtons.push(btn);
          }
          if (uniqueMenuButtons.length !== 1) {
            failures.push(`Expected strictly 1 settings menu button, found ${uniqueMenuButtons.length}`);
          } else {
            const mBox = await uniqueMenuButtons[0].boundingBox();
            if (!mBox || mBox.x < 1440 * 0.7 || mBox.y < 900 * 0.7) {
              failures.push(`Settings menu button not positioned in bottom-right corner: x=${mBox?.x}, y=${mBox?.y}`);
            }
          }
          const topLeftBtn = await page.$('.absolute.top-3.left-16, .absolute.top-3.left-20, [data-testid="top-left-menu-button"]');
          if (topLeftBtn) {
            failures.push('Redundant top-left settings gear button still exists!');
          }

          // Gate 3.1b: Check 3D Decks & Recessed Wells
          const playerDeckWell = await page.$('[data-testid="player-deck-well"]');
          const oppDeckWell = await page.$('[data-testid="opponent-deck-well"]');
          if (!playerDeckWell || !oppDeckWell) {
            failures.push('3D Deck Wells [data-testid="player-deck-well"] or [data-testid="opponent-deck-well"] missing');
          }

          // Gate 3.1c: Zero Card Borders in Hand Fan
          const handCardEls = await page.$$('[data-testid="hand-card"]');
          for (let i = 0; i < handCardEls.length; i++) {
            const borderStyle = await handCardEls[i].evaluate((el) => {
              const cs = window.getComputedStyle(el);
              return {
                borderWidth: cs.borderWidth,
                boxShadow: cs.boxShadow,
                borderRadius: cs.borderRadius,
              };
            });
            if (borderStyle.borderWidth && borderStyle.borderWidth !== '0px') {
              failures.push(`Hand card #${i} has outer CSS border: ${borderStyle.borderWidth}`);
              break;
            }
          }

          // Spawn board minions to visually demonstrate minion tokens and combat on the board
          await page.evaluate(() => {
            if (window.__hearthlightBattle?.spawnBoardMinionsForTest) {
              window.__hearthlightBattle.spawnBoardMinionsForTest();
            }
          });
          await sleep(350);

          // Gate 3.1d: Board Minions Zero Borders & Zero Redundant Stat Badges
          console.log('  Checking Board Minions for Zero Borders & Zero Redundant Stat Badges...');
          const boardMinions = await page.$$('[data-testid="board-minion"]');
          if (boardMinions.length === 0) {
            failures.push('Expected board minions to be present after spawn helper, found 0');
          } else {
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
                break;
              }
              if (minionData.hasOvalBorder) {
                failures.push(`Board minion #${i} has capsule/oval border overlay`);
                break;
              }
            }
          }

          // Screenshot 2: Active Battlefield Turn 1 with Minions at Rest
          const s2Path = path.join(outDir, '02_battlefield_turn_one.png');
          await page.screenshot({ path: s2Path });
          console.log(`  Saved screenshot: ${path.relative(root, s2Path)}`);

          // Gate 3.1e: True Drag-and-Drop Minion Placement
          console.log('  Testing True Drag-and-Drop Minion Placement with Slot Parting...');
          const dropzone = await page.$('[data-testid="player-board-dropzone"]');
          if (!dropzone) {
            failures.push('Player board dropzone [data-testid="player-board-dropzone"] not found');
          } else {
            // Find a minion card in hand
            const minionInHand = await page.$('[data-testid="hand-card"][data-card-type="MINION"]');
            if (!minionInHand) {
              failures.push('No minion card found in hand to test drag-and-drop');
            } else {
              const hBox = await minionInHand.boundingBox();
              const dzBox = await dropzone.boundingBox();
              if (hBox && dzBox) {
                // Drag start
                await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
                await page.mouse.down();
                await sleep(150);

                // Move into dropzone to trigger slot parting
                await page.mouse.move(dzBox.x + dzBox.width * 0.45, dzBox.y + dzBox.height / 2);
                await sleep(250);

                const slotParting = await page.$('[data-testid="minion-slot-parting-indicator"]');
                if (!slotParting) {
                  failures.push('Minion slot-parting indicator not visible while hovering dropzone');
                } else {
                  console.log('  Slot parting indicator visible!');
                  // Screenshot 2b: Drag-and-Drop Slot Parting Preview
                  const s2bPath = path.join(outDir, '02b_drag_minion_slot_parting.png');
                  await page.screenshot({ path: s2bPath });
                  console.log(`  Saved screenshot: ${path.relative(root, s2bPath)}`);
                }

                // Drop minion into slot
                await page.mouse.up();
                await sleep(350);
              }
            }
          }

          // Test playing a card if hand has playable cards, or test turn pass
          const handCards = await page.$$('[data-testid="hand-card"]');
          console.log(`  Player hand has ${handCards.length} cards.`);

          // Test Hero Power or Attack Targeting with Bezier Arrow
          console.log('  Testing Drag-to-Target Arrow and Combat System...');
          // Advance turn or set mana to 2+ if needed via exposed helper
          await page.evaluate(() => {
            if (window.__hearthlightBattle) {
              window.__hearthlightBattle.setPlayerMana(4, 4);
            }
          });
          await sleep(200);

          // Drag from hero power to opponent hero
          if (playerPower && opponentHero) {
            const pBox = await playerPower.boundingBox();
            const oBox = await opponentHero.boundingBox();
            if (pBox && oBox) {
              const startX = pBox.x + pBox.width / 2;
              const startY = pBox.y + pBox.height / 2;
              const targetX = oBox.x + oBox.width / 2;
              const targetY = oBox.y + oBox.height / 2;

              // Move and press
              await page.mouse.move(startX, startY);
              await page.mouse.down();
              await sleep(100);

              // Move halfway to check targeting arrow
              await page.mouse.move((startX + targetX) / 2, (startY + targetY) / 2);
              await sleep(200);

              const arrowOverlay = await page.$('[data-testid="targeting-arrow"]');
              if (!arrowOverlay) {
                failures.push('Targeting Bezier arrow did not appear during drag targeting');
              }

              // Screenshot 3: Drag Targeting Attack
              const s3Path = path.join(outDir, '03_drag_targeting_attack.png');
              await page.screenshot({ path: s3Path });
              console.log(`  Saved screenshot: ${path.relative(root, s3Path)}`);

              // Drag to target and release
              await page.mouse.move(targetX, targetY);
              await sleep(100);
              await page.mouse.up();
              await sleep(350);

              // Check opponent HP dropped by 1
              const oppHp = await page.$eval(
                '[data-testid="opponent-hero-hp"]',
                (el) => el.textContent
              ).catch(() => null);
              if (oppHp && parseInt(oppHp, 10) >= 30) {
                failures.push(`Opponent HP expected < 30 after Fireblast, got ${oppHp}`);
              } else {
                console.log(`  Opponent HP successfully reduced to: ${oppHp}`);
              }
            }
          }

          // Test Turn Rope
          console.log('  Testing Turn Fuse Rope trigger...');
          await page.evaluate(() => {
            if (window.__hearthlightBattle) {
              window.__hearthlightBattle.triggerRopeNow();
            }
          });
          await sleep(300);

          const turnRope = await page.$('[data-testid="turn-rope"]');
          if (!turnRope) {
            failures.push('Turn burning fuse rope [data-testid="turn-rope"] not found when triggered');
          } else {
            console.log('  Turn rope burning active!');
            const braidedRope = await page.$('[data-testid="braided-hemp-rope"]');
            const emberTip = await page.$('[data-testid="rope-ember-tip"]');
            if (!braidedRope) failures.push('Braided hemp rope SVG [data-testid="braided-hemp-rope"] missing');
            if (!emberTip) failures.push('Incandescent ember tip [data-testid="rope-ember-tip"] missing');
          }

          // Test History Rail Hover Card Preview
          console.log('  Testing History Rail Hover Preview...');
          const historyItem = await page.$('[data-testid="history-item"]');
          if (historyItem) {
            await historyItem.hover();
            await sleep(200);
            const previewCard = await page.$('[data-testid="history-preview-card"]');
            if (!previewCard) {
              failures.push('History hover preview card [data-testid="history-preview-card"] not displayed');
            }
          }

          // Screenshot 4: Turn Rope and Combat
          const s4Path = path.join(outDir, '04_turn_rope_and_combat.png');
          await page.screenshot({ path: s4Path });
          console.log(`  Saved screenshot: ${path.relative(root, s4Path)}`);

          // Test In-Match Menu & Concede
          console.log('  Testing Concede and Match Result Modal...');
          const menuGearBtn = await page.$('[data-testid="battlefield-menu-button"], [data-testid="battle-menu-button"]');
          if (menuGearBtn) {
            await menuGearBtn.click();
            await sleep(200);
            const concedeBtn = await page.$('[data-testid="concede-button"]');
            if (concedeBtn) {
              await concedeBtn.click();
              await sleep(500);

              const resultModal = await page.waitForSelector('[data-testid="match-result-modal"]', {
                timeout: 4000,
              }).catch(() => null);

              if (!resultModal) {
                failures.push('Match result modal did not appear after conceding');
              } else {
                // Screenshot 5: Match Result Modal
                const s5Path = path.join(outDir, '05_match_result_modal.png');
                await page.screenshot({ path: s5Path });
                console.log(`  Saved screenshot: ${path.relative(root, s5Path)}`);

                // Click return to menu
                const returnBtn = await page.$('[data-testid="return-to-menu-button"]');
                if (returnBtn) {
                  await returnBtn.click();
                  await sleep(500);
                }
              }
            }
          }
        }
      }
    }

    // 3.2: Mobile Landscape (667x375) Layout Containment & Hand-to-Minion Zero Overlap
    console.log('\n  Testing Mobile Landscape Viewport (667x375)...');
    const mobilePage = await browser.newPage({ viewport: { width: 667, height: 375 } });
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.evaluate(() => {
      // Direct jump to battlefield for layout test
      if (window.__hearthlightBattle) {
        window.__hearthlightBattle.directLaunch();
        window.__hearthlightBattle.spawnBoardMinionsForTest();
      }
    });
    await sleep(400);

    const mOverflow = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    if (mOverflow.scrollWidth > mOverflow.innerWidth || mOverflow.scrollHeight > mOverflow.innerHeight) {
      failures.push(
        `Mobile landscape overflow detected: ${mOverflow.scrollWidth}x${mOverflow.scrollHeight} > ${mOverflow.innerWidth}x${mOverflow.innerHeight}`
      );
    } else {
      console.log('  Mobile landscape containment verified: 0px overflow.');
    }

    // Assert zero bounding-box overlap when a hand card is hovered on 667x375
    console.log('  Testing Mobile Landscape Hand Hover & Minion Bounding-Box Overlap...');
    await mobilePage.waitForSelector('[data-testid="hand-card"]', { timeout: 5000 });
    await mobilePage.waitForSelector('[data-testid="board-minion"]', { timeout: 5000 });
    const mobileHandCards = await mobilePage.$$('[data-testid="hand-card"]');
    if (mobileHandCards.length > 0) {
      await mobileHandCards[0].hover();
      await sleep(350);

      const overlapCheck = await mobilePage.evaluate(() => {
        const hoveredCard = document.querySelector('[data-testid="hand-card"]:hover') || document.querySelector('[data-testid="hand-card"]');
        const boardMinions = Array.from(document.querySelectorAll('[data-testid="player-board-dropzone"] [data-testid="board-minion"]'));
        if (!hoveredCard || boardMinions.length === 0) return { hasOverlap: false, count: boardMinions.length };

        const cardRect = hoveredCard.getBoundingClientRect();
        let overlap = false;
        let details = [];

        for (const minion of boardMinions) {
          const mRect = minion.getBoundingClientRect();
          const isOverlapping = !(
            cardRect.right < mRect.left ||
            cardRect.left > mRect.right ||
            cardRect.bottom < mRect.top ||
            cardRect.top > mRect.bottom
          );
          if (isOverlapping) {
            overlap = true;
            details.push({
              card: { top: cardRect.top, bottom: cardRect.bottom, left: cardRect.left, right: cardRect.right },
              minion: { top: mRect.top, bottom: mRect.bottom, left: mRect.left, right: mRect.right },
            });
          }
        }
        return { hasOverlap: overlap, details, count: boardMinions.length };
      });

      if (overlapCheck.hasOverlap) {
        failures.push(`Mobile landscape hand card overlap detected with friendly board minions: ${JSON.stringify(overlapCheck.details)}`);
      } else {
        console.log(`  Zero bounding-box overlap verified between hovered hand card and ${overlapCheck.count} friendly board minions.`);
      }

      const s6Path = path.join(outDir, '06_mobile_landscape_active_board.png');
      await mobilePage.screenshot({ path: s6Path });
      console.log(`  Saved screenshot: ${path.relative(root, s6Path)}`);
    }

    // 3.3: Portrait Auto-Landscape (393x852) Layout Containment
    console.log('\n  Testing Portrait Viewport (393x852)...');
    const portraitPage = await browser.newPage({ viewport: { width: 393, height: 852 } });
    await portraitPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await portraitPage.evaluate(() => {
      if (window.__hearthlightBattle) {
        window.__hearthlightBattle.directLaunch();
        window.__hearthlightBattle.spawnBoardMinionsForTest();
      }
    });
    await sleep(400);
    const pOverflow = await portraitPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    if (pOverflow.scrollWidth > pOverflow.innerWidth || pOverflow.scrollHeight > pOverflow.innerHeight) {
      failures.push(
        `Portrait viewport overflow detected: ${pOverflow.scrollWidth}x${pOverflow.scrollHeight} > ${pOverflow.innerWidth}x${pOverflow.innerHeight}`
      );
    } else {
      console.log('  Portrait viewport containment verified: 0px overflow.');
    }

    const s7Path = path.join(outDir, '07_portrait_auto_landscape_active_board.png');
    await portraitPage.screenshot({ path: s7Path });
    console.log(`  Saved screenshot: ${path.relative(root, s7Path)}`);

  } catch (err) {
    failures.push(`Playwright exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n====================================================');
  console.log('Verification Results');
  console.log('====================================================');
  if (failures.length === 0) {
    console.log('✅ ALL VERIFICATION GATES PASSED!');
    process.exit(0);
  } else {
    console.error(`❌ VERIFICATION FAILED with ${failures.length} issues:\n`);
    failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal harness error:', err);
  process.exit(1);
});
