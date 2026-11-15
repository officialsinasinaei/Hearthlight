import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'offline-refactor');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('====================================================');
  console.log('Hearthlight Offline & Design System Refactor Harness');
  console.log('====================================================\n');

  const failures = [];

  // Gate 1: Check Design System UI components exist and are exported
  console.log('▶ Gate 1: Checking Design System UI Primitives in src/components/ui/...');
  const uiDir = path.join(root, 'src', 'components', 'ui');
  const requiredUiFiles = [
    'index.ts',
    'TavernButton.tsx',
    'TavernModal.tsx',
    'TavernPlaque.tsx',
    'TavernManaCrystal.tsx',
    'RarityGem.tsx',
    'TavernToast.tsx',
    'CardImage.tsx',
  ];

  if (!fs.existsSync(uiDir)) {
    failures.push(`Design system directory ${uiDir} does not exist.`);
  } else {
    for (const f of requiredUiFiles) {
      const p = path.join(uiDir, f);
      if (!fs.existsSync(p)) {
        failures.push(`Required UI primitive missing: src/components/ui/${f}`);
      }
    }
  }

  // Gate 2: Static Scan for External URLs in src/
  console.log('\n▶ Gate 2: Static Scan for External Network URLs in src/...');
  const urlRegex = /https?:\/\/[^\s"'`]+/g;
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.json'))) {
        // Exclude SVG namespaces or oxlint config if any
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(urlRegex) || [];
        const externalAssetUrls = matches.filter(
          (u) =>
            !u.includes('w3.org') &&
            !u.includes('xmlns') &&
            !u.includes('localhost') &&
            !u.includes('127.0.0.1')
        );
        if (externalAssetUrls.length > 0) {
          const rel = path.relative(root, fullPath);
          failures.push(`Found ${externalAssetUrls.length} external URL(s) in ${rel}: ${externalAssetUrls.slice(0, 3).join(', ')}`);
        }
      }
    }
  }
  scanDir(path.join(root, 'src'));

  // Gate 3: Launch Playwright with strict network interception
  console.log('\n▶ Gate 3: Playwright Strict Offline & Functional Browser Test...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  const externalRequests = [];

  try {
    const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

    // Intercept all network traffic: block & record any non-local request
    await page.route('**/*', (route) => {
      const requestUrl = route.request().url();
      if (
        !requestUrl.startsWith('http://localhost') &&
        !requestUrl.startsWith('http://127.0.0.1') &&
        !requestUrl.startsWith('data:') &&
        !requestUrl.startsWith('blob:')
      ) {
        externalRequests.push(requestUrl);
        route.abort('internetdisconnected');
      } else {
        route.continue();
      }
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(400);

    // Test 3.1: Main Menu & Tavern Toast
    console.log('  Testing Main Menu & Tavern Toast...');
    const playBtn = await page.$('button[aria-label="Enter Play Arena"]');
    if (!playBtn) {
      failures.push('Play button not found on Main Menu');
    } else {
      await playBtn.click();
      await sleep(350);
      const toast = await page.$('[data-testid="tavern-toast"]');
      if (!toast) {
        failures.push('Tavern toast notification failed to render on Main Menu');
      }
    }
    await page.screenshot({ path: path.join(outDir, '01_main_menu_offline.png') });

    // Test 3.2: Navigate to Collection
    console.log('  Testing My Collection Navigation...');
    await page.click('[data-testid="my-collection-button"]');
    await page.waitForSelector('[data-testid="book-spine"]', { timeout: 6000 });

    // Wait for all 8 card images to fully load (complete && naturalWidth > 0)
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('[data-testid="collection-card"] img'));
      return imgs.length >= 8 && imgs.every((img) => img.complete && img.naturalWidth > 0);
    }, { timeout: 8000 });
    await sleep(400);

    // Verify Collection Book loaded and check card image sources
    const imgAudit = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('[data-testid="collection-card"] img'));
      return imgs.map((img) => ({
        src: img.src,
        isLocal: img.src.includes('/art/cards/'),
        isExternal: img.src.startsWith('https://') || img.src.startsWith('http://d15f34w2p8l1cc'),
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      }));
    });

    console.log(`  Found ${imgAudit.length} collection card images on page 1`);
    if (imgAudit.length < 8) {
      failures.push(`Expected 8 cards on page 1, found ${imgAudit.length}`);
    }
    for (const img of imgAudit) {
      if (img.isExternal) {
        failures.push(`Card image loaded from external URL: ${img.src}`);
      }
      if (!img.isLocal) {
        failures.push(`Card image is not using local /art/cards/ path: ${img.src}`);
      }
      if (!img.complete || img.naturalWidth === 0) {
        failures.push(`Card image failed to load properly: ${img.src}`);
      }
    }
    await page.screenshot({ path: path.join(outDir, '02_collection_browse_offline.png') });

    // Test 3.3: Mana Filter & Page Turns
    console.log('  Testing Mana Filter & Search...');
    const mana3Btn = await page.$('button[aria-label="3 Mana"]');
    if (mana3Btn) {
      await mana3Btn.click();
      await sleep(300);
    } else {
      failures.push('3 Mana button not found');
    }

    const searchInput = await page.$('[data-testid="collection-search-input"]');
    if (searchInput) {
      await searchInput.fill('Frost');
      await sleep(300);
    }
    await page.screenshot({ path: path.join(outDir, '03_collection_filter_offline.png') });

    // Reset filters
    const allManaBtn = await page.$('button[aria-label="ALL Mana"]');
    if (allManaBtn) await allManaBtn.click();
    if (searchInput) await searchInput.fill('');
    await sleep(300);

    // Test 3.4: Card Inspect Modal
    console.log('  Testing Card Inspect Modal...');
    const firstCard = await page.$('[data-testid="collection-card"]');
    if (firstCard) {
      await firstCard.click();
      await sleep(350);

      const inspectModal = await page.$('[data-testid="card-inspect-modal"]');
      if (!inspectModal) {
        failures.push('Card inspect modal did not open');
      } else {
        const inspectImgSrc = await page.evaluate(() => {
          const img = document.querySelector('[data-testid="card-inspect-modal"] img');
          return img ? { src: img.src, complete: img.complete, naturalWidth: img.naturalWidth } : null;
        });

        if (!inspectImgSrc) {
          failures.push('Card inspect modal image not found');
        } else {
          if (!inspectImgSrc.src.includes('/art/cards/')) {
            failures.push(`Inspect modal image is not local: ${inspectImgSrc.src}`);
          }
          if (!inspectImgSrc.complete || inspectImgSrc.naturalWidth === 0) {
            failures.push(`Inspect modal image failed to render: ${inspectImgSrc.src}`);
          }
        }
      }
    }
    await page.screenshot({ path: path.join(outDir, '04_card_inspect_offline.png') });

    // Close inspect modal
    const closeInspectBtn = await page.$('[aria-label="Close Inspector"]');
    if (closeInspectBtn) {
      await closeInspectBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await sleep(300);

    // Test 3.5: Hero Select View
    console.log('  Testing Hero Select View...');
    await page.click('[data-testid="new-deck-button"]');
    await page.waitForSelector('[data-testid="hero-select-modal"]', { timeout: 6000 });

    // Wait for the modal fade-in and scale spring animation to fully settle to opacity 1
    await page.waitForFunction(() => {
      const modal = document.querySelector('[data-testid="hero-select-modal"]');
      if (!modal) return false;
      const style = window.getComputedStyle(modal);
      return parseFloat(style.opacity) >= 0.99;
    }, { timeout: 5000 });
    await sleep(350);

    const heroModalAudit = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="hero-select-modal"]');
      const chamber = modal ? modal.firstElementChild : null;
      const jaina = document.querySelector('[data-testid="jaina-portrait"]');
      const fireblast = document.querySelector('[data-testid="fireblast-art"]');
      
      const modalStyle = modal ? window.getComputedStyle(modal) : null;
      const chamberStyle = chamber ? window.getComputedStyle(chamber) : null;

      return {
        modalOpacity: modalStyle ? modalStyle.opacity : null,
        chamberOpacity: chamberStyle ? chamberStyle.opacity : null,
        chamberBgColor: chamberStyle ? chamberStyle.backgroundColor : null,
        isPortaledToBody: modal ? modal.parentElement === document.body : false,
        jaina: jaina ? { src: jaina.src, complete: jaina.complete, naturalWidth: jaina.naturalWidth } : null,
        fireblast: fireblast ? { src: fireblast.src, complete: fireblast.complete, naturalWidth: fireblast.naturalWidth } : null,
      };
    });

    console.log('  Hero Select modal audit:', heroModalAudit);
    if (parseFloat(heroModalAudit.modalOpacity || '0') < 0.99) {
      failures.push(`Hero select modal opacity is not >= 0.99: ${heroModalAudit.modalOpacity}`);
    }
    if (parseFloat(heroModalAudit.chamberOpacity || '0') < 0.99) {
      failures.push(`Hero select chamber opacity is not >= 0.99: ${heroModalAudit.chamberOpacity}`);
    }
    if (!heroModalAudit.isPortaledToBody) {
      failures.push('Hero select modal is not portaled to document.body');
    }
    if (heroModalAudit.chamberBgColor && heroModalAudit.chamberBgColor.startsWith('rgba')) {
      const match = heroModalAudit.chamberBgColor.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
      if (match && parseFloat(match[1]) < 1) {
        failures.push(`Hero select chamber has non-solid background: ${heroModalAudit.chamberBgColor}`);
      }
    }

    if (!heroModalAudit.jaina?.src.includes('/art/HERO_08.jpg') || !heroModalAudit.jaina?.complete || heroModalAudit.jaina?.naturalWidth === 0) {
      failures.push(`Jaina portrait failed to load locally: ${heroModalAudit.jaina?.src}`);
    }
    if (!heroModalAudit.fireblast?.src.includes('/art/CS2_034.jpg') || !heroModalAudit.fireblast?.complete || heroModalAudit.fireblast?.naturalWidth === 0) {
      failures.push(`Fireblast art failed to load locally: ${heroModalAudit.fireblast?.src}`);
    }
    await page.screenshot({ path: path.join(outDir, '05_hero_select_offline.png') });

    // Choose Jaina to create deck and open editor
    await page.click('[data-testid="choose-hero-button"]');
    await page.waitForSelector('[data-testid="hero-select-modal"]', { state: 'hidden', timeout: 4000 });
    await page.waitForSelector('[data-testid="deck-editor-done-button"]', { timeout: 6000 });
    await sleep(300);

    // Test 3.6: Deck Editor Drag and Drop & Done Button
    console.log('  Testing Deck Editor & Incomplete Modal...');
    const dropZone = await page.$('[data-testid="deck-drop-zone"]');
    if (!dropZone) {
      failures.push('Deck editor drop zone not found');
    }

    await page.click('[data-testid="deck-editor-done-button"]');
    await page.waitForSelector('[data-testid="incomplete-deck-modal"]', { timeout: 6000 });

    // Wait for the incomplete modal fade-in and spring animation to fully settle to opacity 1
    await page.waitForFunction(() => {
      const modal = document.querySelector('[data-testid="incomplete-deck-modal"]');
      if (!modal) return false;
      const style = window.getComputedStyle(modal);
      return parseFloat(style.opacity) >= 0.99;
    }, { timeout: 5000 });
    await sleep(350);

    const incompleteModalAudit = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="incomplete-deck-modal"]');
      const card = modal ? modal.firstElementChild : null;
      const modalStyle = modal ? window.getComputedStyle(modal) : null;
      const cardStyle = card ? window.getComputedStyle(card) : null;

      return {
        modalOpacity: modalStyle ? modalStyle.opacity : null,
        cardOpacity: cardStyle ? cardStyle.opacity : null,
        cardBgColor: cardStyle ? cardStyle.backgroundColor : null,
        isPortaledToBody: modal ? modal.parentElement === document.body : false,
      };
    });

    console.log('  Incomplete Deck modal audit:', incompleteModalAudit);
    if (parseFloat(incompleteModalAudit.modalOpacity || '0') < 0.99) {
      failures.push(`Incomplete Deck modal opacity is not >= 0.99: ${incompleteModalAudit.modalOpacity}`);
    }
    if (parseFloat(incompleteModalAudit.cardOpacity || '0') < 0.99) {
      failures.push(`Incomplete Deck card opacity is not >= 0.99: ${incompleteModalAudit.cardOpacity}`);
    }
    if (!incompleteModalAudit.isPortaledToBody) {
      failures.push('Incomplete Deck modal is not portaled to document.body, risking stacking context containment');
    }
    if (incompleteModalAudit.cardBgColor && incompleteModalAudit.cardBgColor.startsWith('rgba')) {
      const match = incompleteModalAudit.cardBgColor.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
      if (match && parseFloat(match[1]) < 1) {
        failures.push(`Incomplete Deck dialog has non-solid background: ${incompleteModalAudit.cardBgColor}`);
      }
    }

    await page.screenshot({ path: path.join(outDir, '06_deck_editor_offline.png') });

    // Assert zero external requests occurred
    if (externalRequests.length > 0) {
      failures.push(
        `LEAK DETECTED: ${externalRequests.length} external network request(s) attempted: ${externalRequests.join(', ')}`
      );
    }
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  if (failures.length > 0) {
    console.error('HARNESS FAILED with the following errors:');
    for (const f of failures) {
      console.error(` ❌ ${f}`);
    }
    console.log('====================================================\n');
    process.exit(1);
  } else {
    console.log('✔ ALL OFFLINE & DESIGN SYSTEM GATES PASSED PERFECTLY!');
    console.log('====================================================\n');
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Harness runtime error:', err);
  process.exit(1);
});
