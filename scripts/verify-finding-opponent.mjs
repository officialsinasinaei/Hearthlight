import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.verification', 'finding-opponent');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('====================================================');
  console.log('Hearthlight Finding Opponent Verification Harness');
  console.log('====================================================\n');

  const failures = [];

  // Gate 1: Check File Presence
  console.log('▶ Gate 1: Checking Required Source Files...');
  const requiredFiles = [
    path.join(root, 'src', 'components', 'FindingOpponentModal.tsx'),
    path.join(root, 'src', 'utils', 'tavernAudio.ts'),
  ];
  for (const f of requiredFiles) {
    if (!fs.existsSync(f)) {
      failures.push(`Required file missing: ${path.relative(root, f)}`);
    }
  }

  // Gate 2: Playwright Viewport & State Verification
  console.log('\n▶ Gate 2: Playwright Matchmaking Spinner Verification...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  try {
    // 2.1: Desktop 1440x900
    console.log('  Testing Desktop Viewport (1440x900)...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await sleep(400);

    const playBtn = await page.$('button[aria-label="Enter Play Arena"]');
    if (!playBtn) {
      failures.push('Play button not found on Main Menu');
    } else {
      await playBtn.click();
      await sleep(350); // Mid-spin window (< 600ms)

      const modal = await page.$('[data-testid="finding-opponent-modal"]');
      if (!modal) {
        failures.push('Finding Opponent modal [data-testid="finding-opponent-modal"] did not open when Play was clicked');
      } else {
        // Assert portaled directly to document.body
        const isChildOfBody = await page.evaluate(() => {
          const el = document.querySelector('[data-testid="finding-opponent-modal"]');
          return el ? el.parentElement === document.body : false;
        });
        if (!isChildOfBody) {
          failures.push('Finding Opponent modal is not portaled directly to document.body');
        }

        // Check bounding box fits in viewport
        const box = await modal.boundingBox();
        if (box) {
          if (box.x < 0 || box.y < 0 || box.x + box.width > 1440 || box.y + box.height > 900) {
            failures.push(`Modal out of bounds on Desktop (1440x900): x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
          }
        }

        // Mid-spin screenshot
        await page.screenshot({ path: path.join(outDir, '01_spinner_mid_spin.png') });
        console.log('  Captured 01_spinner_mid_spin.png');

        // Check required elements: drum, pointers, cancel button, header
        const drum = await page.$('[data-testid="spinner-drum"]');
        const pointers = await page.$('[data-testid="spinner-pointers"]');
        const cancelBtn = await page.$('[data-testid="cancel-matchmaking-button"]') || await page.$('[data-testid="spinner-cancel-button"]');
        const tipBar = await page.$('[data-testid="spinner-tip-bar"]');
        const header = await page.$('[data-testid="finding-opponent-header"]');

        if (!drum) failures.push('Spinner drum [data-testid="spinner-drum"] missing');
        if (!pointers) failures.push('Spinner pointers [data-testid="spinner-pointers"] missing');
        if (!cancelBtn) failures.push('Cancel button [data-testid="cancel-matchmaking-button"] missing');
        if (!tipBar) failures.push('Tip bar [data-testid="spinner-tip-bar"] missing');
        if (!header) failures.push('Header [data-testid="finding-opponent-header"] missing');

        // Test Cancel Flow:
        console.log('  Testing Cancel Flow...');
        if (cancelBtn) {
          await cancelBtn.click();
          await sleep(300);
          const modalAfterCancel = await page.$('[data-testid="finding-opponent-modal"]');
          if (modalAfterCancel) {
            failures.push('Modal failed to close when Cancel was clicked');
          }
        }
      }
    }

    // 2.2: Lock-in flow on Desktop
    console.log('  Testing Match Lock-in Flow...');
    const rePlayBtn = await page.$('button[aria-label="Enter Play Arena"]');
    if (rePlayBtn) {
      await rePlayBtn.click();
      // Wait for spin to complete and decelerate onto "Worthy Opponent" (~3.6s + buffer)
      await sleep(3700);

      const modal = await page.$('[data-testid="finding-opponent-modal"]');
      if (modal) {
        // Check "Worthy Opponent" locked text
        const lockedText = await page.$eval('[data-testid="spinner-active-slot"]', (el) => el.textContent?.trim());
        if (lockedText !== 'Worthy Opponent') {
          failures.push(`Expected active slot to lock on "Worthy Opponent", got "${lockedText}"`);
        }

        // Check Cancel button retracted
        const isRetracted = await page.evaluate(() => {
          const btn = document.querySelector('[data-testid="cancel-matchmaking-button"]') || document.querySelector('[data-testid="spinner-cancel-button"]');
          if (!btn) return true; // Removed
          const style = window.getComputedStyle(btn);
          const opacity = parseFloat(style.opacity);
          const transform = style.transform;
          return opacity === 0 || transform.includes('matrix') || btn.getAttribute('data-retracted') === 'true';
        });
        if (!isRetracted) {
          failures.push('Cancel button did not retract upon opponent lock-in');
        }

        // Capture locked frame
        await page.screenshot({ path: path.join(outDir, '02_spinner_locked_worthy.png') });
        console.log('  Captured 02_spinner_locked_worthy.png');

        // Wait for showcase hold (1.8s) + exit
        console.log('  Waiting for post-lock showcase and modal dismissal...');
        await sleep(2200);

        const modalAfterShowcase = await page.$('[data-testid="finding-opponent-modal"]');
        if (modalAfterShowcase) {
          failures.push('Modal did not dismiss automatically after lock-in showcase');
        }

        // Verify toast appears
        const toast = await page.$('[data-testid="tavern-toast"]');
        if (!toast) {
          failures.push('Celebratory tavern toast did not appear after matchmaking completion');
        }

        // Verify ZERO battlefield screens are mounted
        const battlefield = await page.$('[data-testid="battlefield-screen"]');
        if (battlefield) {
          failures.push('VIOLATION: Battlefield screen was mounted, violating user constraint!');
        }
      }
    }

    // 2.3: Mobile Landscape 667x375 Viewport Containment
    console.log('  Testing Mobile Landscape Viewport (667x375)...');
    await page.setViewportSize({ width: 667, height: 375 });
    await sleep(200);
    const mobilePlayBtn = await page.$('button[aria-label="Enter Play Arena"]');
    if (mobilePlayBtn) {
      await mobilePlayBtn.click();
      await sleep(400);

      const mobileModal = await page.$('[data-testid="finding-opponent-modal"]');
      if (mobileModal) {
        const box = await mobileModal.boundingBox();
        if (box) {
          if (box.x < 0 || box.y < 0 || box.x + box.width > 667 || box.y + box.height > 375) {
            failures.push(`Modal out of bounds on Mobile Landscape (667x375): x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
          }
        }

        // Assert strict viewport containment (top >= 4, bottom <= 371) for header and cancel button
        const mobileHeader = await page.$('[data-testid="finding-opponent-header"]');
        if (!mobileHeader) {
          failures.push('Header [data-testid="finding-opponent-header"] missing on mobile');
        } else {
          const hBox = await mobileHeader.boundingBox();
          if (hBox && hBox.y < 4) {
            failures.push(`Header clipped at top on 667x375: y=${hBox.y} < 4`);
          }
        }

        const mobileCancel = await page.$('[data-testid="cancel-matchmaking-button"]') || await page.$('[data-testid="spinner-cancel-button"]');
        if (!mobileCancel) {
          failures.push('Cancel button [data-testid="cancel-matchmaking-button"] missing on mobile');
        } else {
          const cBox = await mobileCancel.boundingBox();
          if (cBox && (cBox.y + cBox.height > 375 - 4)) {
            failures.push(`Cancel button clipped at bottom on 667x375: bottom=${cBox.y + cBox.height} > 371`);
          }
        }

        await page.screenshot({ path: path.join(outDir, '03_spinner_mobile_landscape.png') });
        console.log('  Captured 03_spinner_mobile_landscape.png');

        const cancelBtn = await page.$('[data-testid="cancel-matchmaking-button"]') || await page.$('[data-testid="spinner-cancel-button"]');
        if (cancelBtn) await cancelBtn.click();
      }
    }
  } catch (err) {
    failures.push(`Playwright exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log('Verification Results:');
  if (failures.length === 0) {
    console.log('✓ ALL GATES PASSED (100% SUCCESS)');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error(`✗ ${failures.length} FAILURE(S) DETECTED:`);
    for (const f of failures) {
      console.error(`  - ${f}`);
    }
    console.log('====================================================');
    process.exit(1);
  }
}

run();
