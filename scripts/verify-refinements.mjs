import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'refinements');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('====================================================');
  console.log('Hearthlight UI/UX Refinements Verification Suite');
  console.log('====================================================\n');

  const failures = [];

  // Check 1: GameBoardScreen.tsx deleted
  const boardFilePath = path.join(root, 'src', 'components', 'board', 'GameBoardScreen.tsx');
  if (fs.existsSync(boardFilePath)) {
    failures.push(`Expected GameBoardScreen.tsx to be deleted, but file still exists at ${boardFilePath}`);
  } else {
    console.log('✔ Check 1: GameBoardScreen.tsx successfully deleted.');
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  try {
    // ----------------------------------------------------
    // Test 1: Main Menu & Tavern Toast on Play Button
    // ----------------------------------------------------
    console.log('\n▶ Test 1: Main Menu & Play Button Toast (852x393)');
    const page852 = await browser.newPage({ viewport: { width: 852, height: 393 } });
    await page852.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await sleep(400);

    // Measure Main Menu Box Proportions
    const boxAudit = await page852.evaluate(() => {
      const box = document.querySelector('[data-testid="main-menu-box"]');
      if (!box) return { found: false };
      const r = box.getBoundingClientRect();
      return {
        found: true,
        width: r.width,
        height: r.height,
        vwPct: (r.width / window.innerWidth) * 100,
        vhPct: (r.height / window.innerHeight) * 100,
        aspectRatio: r.width / (r.height || 1),
      };
    });

    console.log('  Main Menu Box metrics:', boxAudit);
    if (!boxAudit.found) {
      failures.push('Main menu box not found with [data-testid="main-menu-box"]');
    } else {
      if (boxAudit.vwPct > 82) {
        failures.push(`Main menu box is too wide: ${boxAudit.vwPct.toFixed(1)}vw > 82vw limit`);
      }
      if (boxAudit.vhPct > 64) {
        failures.push(`Main menu box is too tall: ${boxAudit.vhPct.toFixed(1)}vh > 64vh limit`);
      }
    }

    // Click Play Button & Assert Toast Notification with Bespoke SVG Icon (No Raw Emoji)
    const playBtn = await page852.$('button[aria-label="Enter Play Arena"]');
    if (!playBtn) {
      failures.push('Play button not found on Main Menu');
    } else {
      await playBtn.click();
      await sleep(350);

      const toastCheck = await page852.evaluate(() => {
        const toast = document.querySelector('[data-testid="tavern-toast"]');
        const board = document.querySelector('[data-testid="game-board"]');
        const svgIcon = toast?.querySelector('svg');
        const rawText = toast ? toast.textContent || '' : '';
        return {
          hasToast: !!toast,
          toastText: rawText.trim(),
          hasBespokeSvg: !!svgIcon,
          hasRawSwordEmoji: rawText.includes('⚔'),
          hasBoard: !!board,
        };
      });

      console.log('  Play click result:', toastCheck);
      if (!toastCheck.hasToast) {
        failures.push('Expected tavern toast notification when clicking Play button, but none appeared.');
      }
      if (!toastCheck.hasBespokeSvg) {
        failures.push('Expected bespoke SVG crossed-swords icon inside Tavern Toast, but none found.');
      }
      if (toastCheck.hasRawSwordEmoji) {
        failures.push('Tavern toast still contains raw Unicode sword emoji ⚔️.');
      }
      if (toastCheck.hasBoard) {
        failures.push('Expected NO game board screen to mount on Play button click.');
      }
    }

    await page852.screenshot({ path: path.join(outDir, '01_main_menu_toast.png') });
    await page852.close();

    // ----------------------------------------------------
    // Test 2: Collection View & Rarity Removal (667x375)
    // ----------------------------------------------------
    console.log('\n▶ Test 2: Collection View, Artwork & Search Bar (667x375)');
    const page667 = await browser.newPage({ viewport: { width: 667, height: 375 } });
    await page667.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page667.click('[data-testid="my-collection-button"]');
    await page667.waitForSelector('[data-testid="book-spine"]', { timeout: 6000 });

    // Wait for all 8 card images to fully load (complete && naturalWidth > 0)
    await page667.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('[data-testid="collection-card"] img'));
      return imgs.length >= 8 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 8000 });
    await sleep(400);

    const rarityAndSearchAudit = await page667.evaluate(() => {
      const rarityPlaques = Array.from(document.querySelectorAll('[data-testid="rarity-badge"]'));
      const legendCrowns = Array.from(document.querySelectorAll('[data-testid="legend-crown"]'));
      const textMatches = Array.from(document.querySelectorAll('*')).filter((el) => {
        const t = el.textContent?.trim();
        return t === 'COMMON' || t === 'RARE' || t === 'EPIC' || t === 'LEGENDARY' || t === '★ Legend' || t === '★ LEGEND';
      });

      // Card image verification
      const cardImgs = Array.from(document.querySelectorAll('[data-testid="collection-card"] img'));
      const loadedCardImgs = cardImgs.filter((img) => img.complete && img.naturalWidth > 0);

      // Search container and input sizing
      const searchContainer = document.querySelector('[data-testid="collection-search"]');
      const searchInput = document.querySelector('[data-testid="collection-search-input"]');
      const manaTray = document.querySelector('[data-testid="mana-tray"]');

      const sRect = searchContainer ? searchContainer.getBoundingClientRect() : null;
      const iRect = searchInput ? searchInput.getBoundingClientRect() : null;
      const tRect = manaTray ? manaTray.getBoundingClientRect() : null;

      const searchOverflow = sRect && tRect ? sRect.right > tRect.right + 2 : false;
      const overflowMargin = sRect && tRect ? tRect.right - sRect.right : null;

      // Deck avatar in sidebar for star overlay and image load
      const avatarImg = document.querySelector('[data-testid="deck-avatar"] img');
      const avatarStarSvg = document.querySelector('[data-testid="deck-avatar-star"]');

      return {
        cardImgsCount: cardImgs.length,
        loadedCardImgsCount: loadedCardImgs.length,
        rarityPlaquesCount: rarityPlaques.length,
        legendCrownsCount: legendCrowns.length,
        textMatchesCount: textMatches.length,
        searchWidth: iRect ? iRect.width : 0,
        searchOverflow,
        overflowMargin,
        hasAvatarStar: !!avatarStarSvg,
        avatarLoaded: avatarImg ? avatarImg.complete && avatarImg.naturalWidth > 0 : false,
        avatarNaturalWidth: avatarImg ? avatarImg.naturalWidth : 0,
        avatarSrc: avatarImg ? avatarImg.src : null,
      };
    });

    console.log('  Collection browse audit:', rarityAndSearchAudit);
    if (!rarityAndSearchAudit.avatarLoaded) {
      failures.push(`Deck avatar image failed to load with naturalWidth > 0 (src: ${rarityAndSearchAudit.avatarSrc})`);
    }
    if (rarityAndSearchAudit.loadedCardImgsCount < 8) {
      failures.push(`Expected 8 loaded card images in collection book, but only ${rarityAndSearchAudit.loadedCardImgsCount} loaded with naturalWidth > 0.`);
    }
    if (rarityAndSearchAudit.rarityPlaquesCount > 0) {
      failures.push(`Expected 0 rarity plaques in browse mode, found ${rarityAndSearchAudit.rarityPlaquesCount}`);
    }
    if (rarityAndSearchAudit.legendCrownsCount > 0) {
      failures.push(`Expected 0 legend crowns in browse mode, found ${rarityAndSearchAudit.legendCrownsCount}`);
    }
    if (rarityAndSearchAudit.searchWidth < 80) {
      failures.push(`Search input width (${rarityAndSearchAudit.searchWidth}px) is too narrow for "Search..." placeholder.`);
    }
    if (rarityAndSearchAudit.searchOverflow) {
      failures.push(`Search input overflows the mana control bar on 667x375 (margin: ${rarityAndSearchAudit.overflowMargin}px)`);
    }
    if (rarityAndSearchAudit.hasAvatarStar) {
      failures.push('Mage deck avatar contains stray star overlay in center');
    }

    await page667.screenshot({ path: path.join(outDir, '02_collection_browse.png') });

    // ----------------------------------------------------
    // Test 3: Card Inspect Modal (No Redundant Stats & Full Viewport Fit)
    // ----------------------------------------------------
    console.log('\n▶ Test 3: Card Inspect Modal Redundancy & Viewport Containment Check (667x375)');
    const firstCard = await page667.$('[data-testid="collection-card"]');
    if (firstCard) {
      await firstCard.click();
      await page667.waitForSelector('[data-testid="card-inspect-modal"]', { timeout: 4000 });

      // Wait for inspected card image to load
      await page667.waitForFunction(() => {
        const img = document.querySelector('[data-testid="card-inspect-modal"] img');
        return img && img.complete && img.naturalWidth > 0;
      }, { timeout: 6000 });
      await sleep(350);

      const inspectAudit = await page667.evaluate(() => {
        const modal = document.querySelector('[data-testid="card-inspect-modal"]');
        if (!modal) return { found: false };
        const text = modal.textContent || '';
        const hasManaBadge = /Mana\s*\d/i.test(text);
        const hasAttackBadge = /⚔\s*\d/.test(text);
        const hasHealthBadge = /♥\s*\d/.test(text);
        const hasTypeBadge = /Type\s*MINION|Type\s*SPELL/i.test(text);
        const hasRarityBadge = modal.querySelector('[data-testid="rarity-badge"]') !== null;
        const flavorBox = modal.querySelector('[data-testid="flavor-text"]');
        const img = modal.querySelector('img');

        const fRect = flavorBox ? flavorBox.getBoundingClientRect() : null;
        const iRect = img ? img.getBoundingClientRect() : null;

        const flavorWithinViewport = fRect ? fRect.bottom <= window.innerHeight && fRect.top >= 0 : false;
        const imgWithinViewport = iRect ? iRect.bottom <= window.innerHeight && iRect.top >= 0 : false;

        return {
          found: true,
          hasManaBadge,
          hasAttackBadge,
          hasHealthBadge,
          hasTypeBadge,
          hasRarityBadge,
          hasFlavorText: !!flavorBox,
          flavorWithinViewport,
          flavorBottom: fRect ? fRect.bottom : null,
          imgWithinViewport,
          imgBottom: iRect ? iRect.bottom : null,
          imgLoaded: img ? img.complete && img.naturalWidth > 0 : false,
        };
      });

      console.log('  Inspect modal audit:', inspectAudit);
      if (!inspectAudit.imgLoaded) {
        failures.push('Card Inspect modal image failed to load with naturalWidth > 0.');
      }
      if (inspectAudit.hasManaBadge || inspectAudit.hasAttackBadge || inspectAudit.hasHealthBadge || inspectAudit.hasTypeBadge) {
        failures.push('Card Inspect modal still displays redundant Mana, Type, Attack, or Health stat badges.');
      }
      if (inspectAudit.hasRarityBadge) {
        failures.push('Card Inspect modal still displays redundant rarity badge.');
      }
      if (!inspectAudit.hasFlavorText) {
        failures.push('Card Inspect modal is missing flavor text plaque.');
      }
      if (!inspectAudit.flavorWithinViewport) {
        failures.push(`Flavor text plaque overflows viewport vertically on 667x375 (bottom: ${inspectAudit.flavorBottom}px > ${375}px)`);
      }
      if (!inspectAudit.imgWithinViewport) {
        failures.push(`Card image overflows viewport vertically on 667x375 (bottom: ${inspectAudit.imgBottom}px > ${375}px)`);
      }

      await page667.screenshot({ path: path.join(outDir, '03_card_inspect.png') });
      // Close inspect modal by clicking close button
      await page667.click('button[aria-label="Close Inspector"]');
      await sleep(300);
    }

    // ----------------------------------------------------
    // Test 4: Hero Select & Pure Fireblast Art
    // ----------------------------------------------------
    console.log('\n▶ Test 4: Hero Select, Pure Fireblast Art & Choose Button (667x375)');
    await page667.evaluate(() => {
      // Clear decks down if at 9 so new deck button is enabled
      const storeState = window.localStorage.getItem('hearthlight_collection_storage');
      if (storeState) {
        try {
          const parsed = JSON.parse(storeState);
          if (parsed.state?.decks?.length >= 9) {
            parsed.state.decks = parsed.state.decks.slice(0, 3);
            window.localStorage.setItem('hearthlight_collection_storage', JSON.stringify(parsed));
          }
        } catch (e) {}
      }
    });

    const newDeckBtn = await page667.$('[data-testid="new-deck-button"]:not([disabled])');
    if (newDeckBtn) {
      await newDeckBtn.click();
    } else {
      await page667.evaluate(() => {
        const btn = document.querySelector('[data-testid="new-deck-button"]');
        if (btn) btn.removeAttribute('disabled');
      });
      await page667.click('[data-testid="new-deck-button"]');
    }

    await page667.waitForSelector('[data-testid="hero-select-modal"]', { timeout: 6000 });

    // Wait for Jaina and Fireblast images to be fully loaded
    await page667.waitForFunction(() => {
      const jaina = document.querySelector('[data-testid="jaina-portrait"]');
      const fireblast = document.querySelector('[data-testid="fireblast-art"]');
      return jaina && jaina.complete && jaina.naturalWidth > 0 &&
             fireblast && fireblast.complete && fireblast.naturalWidth > 0;
    }, { timeout: 8000 });
    await sleep(400);

    const heroSelectAudit = await page667.evaluate(() => {
      const jainaImg = document.querySelector('[data-testid="jaina-portrait"]');
      const fireblastImg = document.querySelector('[data-testid="fireblast-art"]');
      const chooseBtn = document.querySelector('[data-testid="choose-hero-button"]');

      const cRect = chooseBtn ? chooseBtn.getBoundingClientRect() : null;

      // Active Mage Tile check (bottom tile in center column)
      const activeTile = document.querySelector('[data-testid="hero-tile-mage"]');
      const activeBanner = document.querySelector('[data-testid="mage-tile-banner"]');
      const bannerRect = activeBanner ? activeBanner.getBoundingClientRect() : null;
      const tileRect = activeTile ? activeTile.getBoundingClientRect() : null;

      const bottomBreathingRoom = bannerRect && tileRect ? tileRect.bottom - bannerRect.bottom : 0;
      const bannerContained = bannerRect && tileRect ? bannerRect.bottom <= tileRect.bottom - 3 : false;

      return {
        jainaLoaded: jainaImg ? jainaImg.complete && jainaImg.naturalWidth > 0 : false,
        jainaNaturalWidth: jainaImg ? jainaImg.naturalWidth : 0,
        fireblastLoaded: fireblastImg ? fireblastImg.complete && fireblastImg.naturalWidth > 0 : false,
        fireblastNaturalWidth: fireblastImg ? fireblastImg.naturalWidth : 0,
        fireblastSrc: fireblastImg ? fireblastImg.src : null,
        chooseBtnWithinViewport: cRect ? cRect.bottom <= window.innerHeight && cRect.top >= 0 : false,
        chooseBtnWidth: cRect ? cRect.width : 0,
        chooseBtnHeight: cRect ? cRect.height : 0,
        bannerContained,
        bottomBreathingRoom,
      };
    });

    console.log('  Hero Select audit:', heroSelectAudit);
    if (!heroSelectAudit.bannerContained) {
      failures.push(`Mage tile banner is too close to or overflows bottom edge of tile (breathing room: ${heroSelectAudit.bottomBreathingRoom}px, required >= 3px)`);
    }
    if (!heroSelectAudit.jainaLoaded) {
      failures.push('Jaina portrait failed to load with naturalWidth > 0.');
    }
    if (!heroSelectAudit.fireblastLoaded) {
      failures.push('Fireblast art failed to load with naturalWidth > 0.');
    }
    if (!heroSelectAudit.fireblastSrc || !heroSelectAudit.fireblastSrc.includes('CS2_034.jpg')) {
      failures.push(`Expected Fireblast to use pure CS2_034.jpg illustration, got: ${heroSelectAudit.fireblastSrc}`);
    }
    if (!heroSelectAudit.chooseBtnWithinViewport) {
      failures.push('Choose button overflows viewport on 667x375.');
    }
    if (heroSelectAudit.chooseBtnWidth < 65) {
      failures.push(`Choose button inner diameter is too small (${heroSelectAudit.chooseBtnWidth}px).`);
    }

    await page667.screenshot({ path: path.join(outDir, '04_hero_select_fireblast.png') });
    await page667.close();

    // ----------------------------------------------------
    // Test 5: Drag and Drop Card to Deck (1180x820)
    // ----------------------------------------------------
    console.log('\n▶ Test 5: Drag and Drop Card to Deck Editor (1180x820)');
    const pageTablet = await browser.newPage({ viewport: { width: 1180, height: 820 } });
    await pageTablet.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await pageTablet.click('[data-testid="my-collection-button"]');
    await pageTablet.waitForSelector('[data-testid="book-spine"]', { timeout: 6000 });
    await sleep(300);

    // Open first deck in editor
    await pageTablet.click('[data-testid="deck-list-item"]');
    await pageTablet.waitForSelector('[data-testid="deck-drop-zone"]', { timeout: 4000 });

    // Wait for card images to load
    await pageTablet.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('[data-testid="collection-card"] img'));
      return imgs.length >= 8 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 8000 });
    await sleep(300);

    // Remove 1 card so the deck is 29/30 and has uncapped card slots
    const firstDeckRow = await pageTablet.$('[data-testid="deck-drop-zone"] .group');
    if (firstDeckRow) {
      await firstDeckRow.click();
      await sleep(300);
    }

    const countBefore = await pageTablet.evaluate(() => {
      const el = document.querySelector('[data-testid="deck-card-count"]');
      return el ? parseInt(el.textContent.trim(), 10) : 0;
    });

    // Drag uncapped card to drop zone using page.dragAndDrop
    await pageTablet.dragAndDrop(
      '[data-testid="collection-card"]:not([data-capped="true"])',
      '[data-testid="deck-drop-zone"]'
    );
    await sleep(400);

    const countAfter = await pageTablet.evaluate(() => {
      const el = document.querySelector('[data-testid="deck-card-count"]');
      return el ? parseInt(el.textContent.trim(), 10) : 0;
    });

    console.log(`  Drag & drop result: count before=${countBefore}, count after=${countAfter}`);
    if (countAfter !== countBefore + 1) {
      failures.push(`Expected deck count to increase after card drop: before=${countBefore}, after=${countAfter}`);
    }

    await pageTablet.screenshot({ path: path.join(outDir, '05_deck_editor_drag.png') });
    await pageTablet.close();

  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('Verification Suite Results');
  console.log('====================================================');
  if (failures.length === 0) {
    console.log('🎉 ALL REFINEMENT CHECKS PASSED WITH ZERO FLIGHT DEFECTS!');
    process.exit(0);
  } else {
    console.log(`❌ Found ${failures.length} failure(s):`);
    failures.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    process.exit(1);
  }
}

run();
