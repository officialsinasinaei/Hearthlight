import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const failures = [];

// 1. Check mage-cards.json
const cardsJsonPath = path.join(root, 'src/engine/mage-cards.json');
if (!fs.existsSync(cardsJsonPath)) {
  failures.push('[DATA_FAIL] src/engine/mage-cards.json does not exist.');
} else {
  try {
    const cards = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf8'));
    if (!Array.isArray(cards) || cards.length !== 96) {
      failures.push(`[DATA_FAIL] Expected exactly 96 Standard Mage cards, but found ${Array.isArray(cards) ? cards.length : 'non-array'}.`);
    } else {
      const nonMage = cards.filter(c => c.cardClass && c.cardClass !== 'MAGE');
      if (nonMage.length > 0) {
        failures.push(`[DATA_FAIL] Found ${nonMage.length} non-Mage cards in dataset.`);
      }
    }
  } catch (err) {
    failures.push(`[DATA_FAIL] Failed to parse mage-cards.json: ${err.message}`);
  }
}

// 2. Check useCollectionStore.ts
const storePath = path.join(root, 'src/store/useCollectionStore.ts');
if (!fs.existsSync(storePath)) {
  failures.push('[STORE_FAIL] src/store/useCollectionStore.ts does not exist.');
} else {
  const content = fs.readFileSync(storePath, 'utf8');
  if (!content.includes('activeDeckId') || !content.includes('editingDeckId')) {
    failures.push('[STORE_FAIL] useCollectionStore missing activeDeckId or editingDeckId.');
  }
  if (!content.includes('currentPage') || !content.includes('manaFilter')) {
    failures.push('[STORE_FAIL] useCollectionStore missing pagination or manaFilter state.');
  }
}

// 3. Check Collection Components
const requiredComponents = [
  'src/components/collection/CollectionScreen.tsx',
  'src/components/collection/CollectionBookView.tsx',
  'src/components/collection/CollectionSidebar.tsx',
  'src/components/collection/HeroSelectView.tsx',
  'src/components/collection/CardInspectModal.tsx',
  'src/components/collection/HearthstoneCard.tsx',
];

for (const comp of requiredComponents) {
  const compPath = path.join(root, comp);
  if (!fs.existsSync(compPath)) {
    failures.push(`[COMPONENT_FAIL] ${comp} does not exist.`);
  }
}

// 4. Strict Exclusions Check (No Crafting button, no expansion filter)
for (const comp of requiredComponents) {
  const compPath = path.join(root, comp);
  if (fs.existsSync(compPath)) {
    const content = fs.readFileSync(compPath, 'utf8');
    if (content.toLowerCase().includes('crafting') && !content.toLowerCase().includes('no crafting')) {
      failures.push(`[EXCLUSION_FAIL] ${comp} contains prohibited "Crafting" reference.`);
    }
    if (content.toLowerCase().includes('all sets') || content.toLowerCase().includes('expansion filter')) {
      failures.push(`[EXCLUSION_FAIL] ${comp} contains prohibited expansion filter reference.`);
    }
  }
}

// 5. Visual Quality & Fallback Layer Bleed-Through Verification
const hearthstoneCardPath = path.join(root, 'src/components/collection/HearthstoneCard.tsx');
if (fs.existsSync(hearthstoneCardPath)) {
  const content = fs.readFileSync(hearthstoneCardPath, 'utf8');
  if (!content.includes("imgStatus !== 'loaded'")) {
    failures.push('[CRAFT_FAIL] HearthstoneCard must unmount fallback layer when image is loaded.');
  }
}

const inspectModalPath = path.join(root, 'src/components/collection/CardInspectModal.tsx');
if (fs.existsSync(inspectModalPath)) {
  const content = fs.readFileSync(inspectModalPath, 'utf8');
  if (!content.includes("imgStatus !== 'loaded'")) {
    failures.push('[CRAFT_FAIL] CardInspectModal must unmount fallback layer when image is loaded.');
  }
}

const heroSelectPath = path.join(root, 'src/components/collection/HeroSelectView.tsx');
if (fs.existsSync(heroSelectPath)) {
  const content = fs.readFileSync(heroSelectPath, 'utf8');
  if (content.includes('🧙') || content.includes('🔥') || content.includes('⚔️') || content.includes('🛡️')) {
    failures.push('[CRAFT_FAIL] HeroSelectView contains cartoon emojis; must use bespoke SVGs and official assets.');
  }
  if (!content.includes('CS2_034.png') || !content.includes('HERO_08.png')) {
    failures.push('[CRAFT_FAIL] HeroSelectView missing official Fireblast (CS2_034.png) or Jaina (HERO_08.png) assets.');
  }
}

console.log('--- COLLECTION HARNESS EXECUTION REPORT ---');
if (failures.length > 0) {
  console.log(`FAILS with ${failures.length} issues:`);
  for (const f of failures) {
    console.log(` - ${f}`);
  }
  process.exit(1);
} else {
  console.log('PASS: All Collection screen criteria, 96 Standard Mage dataset, visual craft rules, and exclusions verified!');
  process.exit(0);
}
