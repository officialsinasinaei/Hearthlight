import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'responsive');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

export const DEVICE_PROFILES = [
  {
    name: 'iphone-se-landscape',
    label: 'iPhone SE (Mobile Landscape)',
    viewport: { width: 667, height: 375 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    isPortraitTest: false,
  },
  {
    name: 'iphone-16-pro-landscape',
    label: 'iPhone 15/16 Pro (Mobile Landscape)',
    viewport: { width: 852, height: 393 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isPortraitTest: false,
  },
  {
    name: 'iphone-16-pro-max-landscape',
    label: 'iPhone 16 Pro Max / Pixel 8 Pro (Large Mobile Landscape)',
    viewport: { width: 932, height: 430 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isPortraitTest: false,
  },
  {
    name: 'iphone-16-pro-portrait',
    label: 'iPhone 15/16 Pro Held Vertically (Portrait Auto-Landscape)',
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    isPortraitTest: true,
  },
  {
    name: 'ipad-air-landscape',
    label: 'iPad Air (Tablet Landscape)',
    viewport: { width: 1180, height: 820 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isPortraitTest: false,
  },
  {
    name: 'desktop-widescreen',
    label: 'Desktop Widescreen',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    isPortraitTest: false,
  },
];

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runVerification() {
  console.log('====================================================');
  console.log('Hearthlight Multi-Device Responsive Verification Suite');
  console.log('====================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  const failures = [];
  const results = [];

  for (const profile of DEVICE_PROFILES) {
    console.log(`\n▶ Testing Profile: ${profile.label} (${profile.viewport.width}x${profile.viewport.height})`);

    const context = await browser.newContext({
      viewport: profile.viewport,
      deviceScaleFactor: profile.deviceScaleFactor,
      isMobile: profile.isMobile ?? false,
      hasTouch: profile.hasTouch ?? false,
    });

    const page = await context.newPage();

    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-testid="my-collection-button"]', { timeout: 6000 });
      await sleep(300);

      // --- 1. Main Menu Verification ---
      console.log('  - Checking Screen: Main Menu');
      
      const menuOverflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        return {
          scrollWidth: docEl.scrollWidth,
          innerWidth: window.innerWidth,
          scrollHeight: docEl.scrollHeight,
          innerHeight: window.innerHeight,
          hasOverflowX: docEl.scrollWidth > window.innerWidth,
          hasOverflowY: docEl.scrollHeight > window.innerHeight,
        };
      });

      if (menuOverflow.hasOverflowX || menuOverflow.hasOverflowY) {
        failures.push(`[${profile.name}] Main Menu page overflow: scroll(${menuOverflow.scrollWidth}x${menuOverflow.scrollHeight}) vs inner(${menuOverflow.innerWidth}x${menuOverflow.innerHeight})`);
      }

      // Check portrait rotation if portrait test
      if (profile.isPortraitTest) {
        const portraitCheck = await page.evaluate(() => {
          const shell = document.querySelector('.landscape-forced-portrait');
          if (!shell) return { active: false };
          const rect = shell.getBoundingClientRect();
          return {
            active: true,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
          };
        });

        if (!portraitCheck.active) {
          failures.push(`[${profile.name}] Expected .landscape-forced-portrait shell to be active in portrait mode.`);
        }
      }

      // Check Play Medallion subtitle containment in non-portrait landscape
      if (!profile.isPortraitTest) {
        const playBtnAudit = await page.evaluate(() => {
          const btn = document.querySelector('button[aria-label="Enter Play Arena"]');
          if (!btn) return { found: false };
          const subText = Array.from(btn.querySelectorAll('span')).find(s => s.innerText.includes('CASUAL') || s.innerText.includes('Casual'));
          if (!subText) return { found: true, hasSubtitle: false };
          const btnRect = btn.getBoundingClientRect();
          const subRect = subText.getBoundingClientRect();
          
          const r = btnRect.width / 2;
          const centerY = btnRect.top + r;
          const spanMidY = (subRect.top + subRect.bottom) / 2;
          const dy = Math.abs(spanMidY - centerY);
          const chordHalfW = Math.sqrt(Math.max(0, r * r - dy * dy));
          const circleLeftAtY = (btnRect.left + r) - chordHalfW;
          const circleRightAtY = (btnRect.left + r) + chordHalfW;

          const overflows = subRect.left < circleLeftAtY - 1 || subRect.right > circleRightAtY + 1;
          return {
            found: true,
            hasSubtitle: true,
            overflows,
            subLeft: subRect.left,
            circleLeft: circleLeftAtY,
            subRight: subRect.right,
            circleRight: circleRightAtY,
          };
        });
        if (playBtnAudit.found && playBtnAudit.hasSubtitle && playBtnAudit.overflows) {
          failures.push(`[${profile.name}] Play Medallion subtitle overflows dial: ${JSON.stringify(playBtnAudit)}`);
        }
      }

      await page.screenshot({
        path: path.join(outDir, `${profile.name}-menu.png`),
      });

      // --- 2. My Collection Screen ---
      console.log('  - Checking Screen: My Collection');
      await page.click('[data-testid="my-collection-button"]');
      await page.waitForSelector('[data-testid="book-spine"]', { timeout: 6000 });
      // Wait for card artwork to settle
      await page.waitForFunction(() => {
        const imgs = Array.from(document.querySelectorAll('[data-testid="collection-card"] img'));
        return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
      }, { timeout: 8000 }).catch(() => {});
      await sleep(400);

      const colOverflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        return {
          hasOverflowX: docEl.scrollWidth > window.innerWidth,
          hasOverflowY: docEl.scrollHeight > window.innerHeight,
          scrollWidth: docEl.scrollWidth,
          scrollHeight: docEl.scrollHeight,
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
        };
      });

      if (colOverflow.hasOverflowX || colOverflow.hasOverflowY) {
        failures.push(`[${profile.name}] Collection page overflow: scroll(${colOverflow.scrollWidth}x${colOverflow.scrollHeight}) vs inner(${colOverflow.innerWidth}x${colOverflow.innerHeight})`);
      }

      // Check spine collision and card bounds
      const cardSpineAudit = await page.evaluate(() => {
        const spine = document.querySelector('[data-testid="book-spine"]');
        const cards = Array.from(document.querySelectorAll('[data-testid="collection-card"]'));
        const spineRect = spine ? spine.getBoundingClientRect() : null;
        
        const collisions = [];
        const outOfBounds = [];

        const maxX = window.innerWidth;
        const maxY = window.innerHeight;

        cards.forEach((card, idx) => {
          const rect = card.getBoundingClientRect();
          // Check collision with spine
          if (spineRect) {
            const overlaps = !(
              rect.right <= spineRect.left ||
              rect.left >= spineRect.right ||
              rect.bottom <= spineRect.top ||
              rect.top >= spineRect.bottom
            );
            if (overlaps) {
              collisions.push({ cardIndex: idx, cardRect: rect, spineRect });
            }
          }

          // Check if card clips outside stage/screen viewport
          if (rect.top < -2 || rect.bottom > maxY + 4 || rect.left < -2 || rect.right > maxX + 4) {
            outOfBounds.push({ cardIndex: idx, rect, bounds: { maxX, maxY } });
          }
        });

        // Check mana filter buttons
        const manaButtons = Array.from(document.querySelectorAll('button[aria-label*="Mana"]'));
        const manaClipped = [];
        manaButtons.forEach((btn, i) => {
          const r = btn.getBoundingClientRect();
          if (r.top < -2 || r.bottom > window.innerHeight + 4 || r.left < -2 || r.right > window.innerWidth + 4) {
            manaClipped.push({ index: i, rect: r });
          }
        });

        // Check rarity badge containment inside card slot
        const rarityBadges = Array.from(document.querySelectorAll('[data-testid="rarity-badge"]'));
        const badgeOverflows = [];
        rarityBadges.forEach((badge, idx) => {
          const bRect = badge.getBoundingClientRect();
          const cardEl = badge.closest('[data-testid="collection-card"]');
          if (cardEl) {
            const cRect = cardEl.getBoundingClientRect();
            if (bRect.right > cRect.right + 2 || bRect.left < cRect.left - 2) {
              badgeOverflows.push({
                index: idx,
                badgeRight: bRect.right,
                cardRight: cRect.right,
                badgeLeft: bRect.left,
                cardLeft: cRect.left,
              });
            }
          }
        });

        return {
          cardsFound: cards.length,
          hasSpine: !!spine,
          collisions,
          outOfBounds,
          manaButtonsCount: manaButtons.length,
          manaClipped,
          badgeOverflows,
        };
      });

      if (cardSpineAudit.collisions.length > 0) {
        failures.push(`[${profile.name}] Card-spine collision detected for ${cardSpineAudit.collisions.length} cards.`);
      }
      if (cardSpineAudit.outOfBounds.length > 0) {
        failures.push(`[${profile.name}] Collection cards clipped outside viewport: ${JSON.stringify(cardSpineAudit.outOfBounds)}`);
      }
      if (cardSpineAudit.manaClipped.length > 0) {
        failures.push(`[${profile.name}] Mana filter buttons pushed off screen: ${cardSpineAudit.manaClipped.length} buttons.`);
      }
      if (cardSpineAudit.badgeOverflows.length > 0) {
        failures.push(`[${profile.name}] Rarity badge overflowed card cell: ${JSON.stringify(cardSpineAudit.badgeOverflows)}`);
      }

      await page.screenshot({
        path: path.join(outDir, `${profile.name}-collection.png`),
      });

      // --- 3. Deck Editor Screen ---
      console.log('  - Checking Screen: Deck Editor');
      await page.click('[data-testid="deck-list-item"]');
      await page.waitForSelector('[data-testid="deck-editor-title"]', { timeout: 6000 });
      await sleep(400);

      const deckEditorAudit = await page.evaluate(() => {
        const title = document.querySelector('[data-testid="deck-editor-title"]');
        const doneBtn = document.querySelector('[data-testid="deck-editor-done-button"]');

        const errors = [];
        if (!title) errors.push('Missing deck editor title');
        if (!doneBtn) errors.push('Missing Done button');
        if (doneBtn) {
          const r = doneBtn.getBoundingClientRect();
          if (r.bottom > window.innerHeight + 4) {
            errors.push(`Done button clipped: bottom=${r.bottom} > ${window.innerHeight}`);
          }
        }
        return { errors };
      });

      if (deckEditorAudit.errors.length > 0) {
        failures.push(`[${profile.name}] Deck Editor layout errors: ${deckEditorAudit.errors.join('; ')}`);
      }

      await page.screenshot({
        path: path.join(outDir, `${profile.name}-deck-editor.png`),
      });

      // Close Deck Editor (click Done)
      await page.click('[data-testid="deck-editor-done-button"]');
      await page.waitForTimeout(400);

      // --- 4. Hero Select Screen ---
      console.log('  - Checking Screen: Hero Select');
      await page.click('[data-testid="new-deck-button"]');
      await page.waitForSelector('[data-testid="choose-hero-button"]', { timeout: 6000 });
      // Wait for Jaina and Fireblast images to settle
      await page.waitForFunction(() => {
        const jaina = document.querySelector('[data-testid="jaina-portrait"]');
        const fireblast = document.querySelector('[data-testid="fireblast-art"]');
        return jaina && fireblast && jaina.complete && jaina.naturalWidth > 0 && fireblast.complete && fireblast.naturalWidth > 0;
      }, { timeout: 8000 }).catch(() => {});
      await sleep(400);

      const heroSelectAudit = await page.evaluate(() => {
        const heroTiles = document.querySelectorAll('[data-testid^="hero-tile-"]');
        const chooseBtn = document.querySelector('[data-testid="choose-hero-button"]');
        const backBtn = document.querySelector('[data-testid="hero-select-back-button"]');

        const errors = [];
        if (!chooseBtn) errors.push('Missing Choose button');
        if (chooseBtn) {
          const r = chooseBtn.getBoundingClientRect();
          if (r.bottom > window.innerHeight + 4) errors.push(`Choose button clipped off-screen: bottom=${r.bottom}`);
        }
        if (backBtn) {
          const r = backBtn.getBoundingClientRect();
          if (r.bottom > window.innerHeight + 4) errors.push(`Hero Select Back button clipped off-screen: bottom=${r.bottom}`);
        }
        return { errors, tileCount: heroTiles.length };
      });

      if (heroSelectAudit.errors.length > 0) {
        failures.push(`[${profile.name}] Hero Select layout errors: ${heroSelectAudit.errors.join('; ')}`);
      }

      await page.screenshot({
        path: path.join(outDir, `${profile.name}-hero-select.png`),
      });

      // Close Hero Select (click Back)
      await page.click('[data-testid="hero-select-back-button"]');
      await page.waitForTimeout(400);

      // Return to Main Menu
      await page.evaluate(() => {
        const backMenuBtn = Array.from(document.querySelectorAll('button')).find((b) =>
          (b.innerText || '').toLowerCase().includes('back to main menu')
        );
        if (backMenuBtn) backMenuBtn.click();
      });
      await page.waitForSelector('button[aria-label="Enter Play Arena"]', { timeout: 6000 });
      await sleep(400);

      // --- 5. 1v1 Game Board Screen ---
      console.log('  - Checking Screen: 1v1 Game Board');
      await page.click('button[aria-label="Enter Play Arena"]');
      await page.waitForSelector('[data-testid="game-board"]', { timeout: 6000 });
      // Wait for battlefield images to settle
      await page.waitForFunction(() => {
        const imgs = Array.from(document.querySelectorAll('[data-testid="game-board"] img'));
        return imgs.length > 0 && imgs.every((img) => img.complete && img.naturalWidth > 0);
      }, { timeout: 8000 }).catch(() => {});
      await sleep(400);

      const boardAudit = await page.evaluate(() => {
        const board = document.querySelector('[data-testid="game-board"]');
        if (!board) {
          return { error: 'Missing [data-testid="game-board"] element. 1v1 Battlefield not mounted!' };
        }

        const opponentHero = document.querySelector('[data-testid="opponent-hero"]');
        const playerHero = document.querySelector('[data-testid="player-hero"]');
        const endTurnBtn = document.querySelector('[data-testid="end-turn-button"]');
        const playerHand = document.querySelector('[data-testid="player-hand"]');
        const manaTray = document.querySelector('[data-testid="player-mana-tray"]');

        const errors = [];
        if (!opponentHero) errors.push('Missing opponent hero');
        if (!playerHero) errors.push('Missing player hero');
        if (!endTurnBtn) errors.push('Missing End Turn button');
        if (!playerHand) errors.push('Missing player hand fan');
        if (!manaTray) errors.push('Missing player mana tray');

        const docEl = document.documentElement;
        if (docEl.scrollWidth > window.innerWidth) errors.push(`Board scrollWidth (${docEl.scrollWidth}) > innerWidth (${window.innerWidth})`);
        if (docEl.scrollHeight > window.innerHeight) errors.push(`Board scrollHeight (${docEl.scrollHeight}) > innerHeight (${window.innerHeight})`);

        const maxY = window.innerHeight + 4;
        const maxX = window.innerWidth + 4;

        if (opponentHero) {
          const r = opponentHero.getBoundingClientRect();
          if (r.top < -2 || r.bottom > maxY) errors.push(`Opponent hero clipped: top=${r.top}, bottom=${r.bottom}`);
        }
        if (playerHero) {
          const r = playerHero.getBoundingClientRect();
          if (r.top < -2 || r.bottom > maxY || r.left < -2) errors.push(`Player hero clipped: top=${r.top}, bottom=${r.bottom}, left=${r.left}`);
        }
        if (playerHand) {
          const r = playerHand.getBoundingClientRect();
          if (r.top < -2 || r.bottom > maxY) errors.push(`Player hand fan clipped: top=${r.top}, bottom=${r.bottom}`);
        }
        if (manaTray) {
          const r = manaTray.getBoundingClientRect();
          if (r.top < -2 || r.bottom > maxY || r.right > maxX) errors.push(`Player mana tray clipped: top=${r.top}, bottom=${r.bottom}, right=${r.right}`);
        }
        if (endTurnBtn) {
          const r = endTurnBtn.getBoundingClientRect();
          if (r.top < -2 || r.bottom > maxY || r.right > maxX) errors.push(`End Turn button clipped: ${r.top} - ${r.bottom}`);
        }

        return { errors };
      });

      if (boardAudit.error) {
        failures.push(`[${profile.name}] 1v1 Game Board: ${boardAudit.error}`);
      } else if (boardAudit.errors.length > 0) {
        failures.push(`[${profile.name}] 1v1 Game Board errors: ${boardAudit.errors.join('; ')}`);
      }

      await page.screenshot({
        path: path.join(outDir, `${profile.name}-board.png`),
      });

      results.push({ profile: profile.name, status: 'DONE' });
    } catch (err) {
      console.error(`  ✖ Error on profile ${profile.name}:`, err.message);
      failures.push(`[${profile.name}] Unhandled error: ${err.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  console.log('\n====================================================');
  console.log('Verification Suite Results Summary');
  console.log('====================================================');
  if (failures.length === 0) {
    console.log('🎉 ALL VIEWPORTS AND SCREENS PASSED WITH ZERO FLIGHT DEFECTS!');
    return 0;
  } else {
    console.log(`❌ Found ${failures.length} failure(s):`);
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    return 1;
  }
}

runVerification()
  .then((code) => {
    process.exit(code);
  })
  .catch((err) => {
    console.error('Fatal harness error:', err);
    process.exit(1);
  });
