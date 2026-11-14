import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const menuFiles = [
  'src/components/menu/MainMenuScreen.tsx',
  'src/components/menu/CenterPlayMedallion.tsx',
  'src/components/menu/CollectionTrayButton.tsx',
  'src/components/menu/BottomHudBar.tsx',
];

const failures = [];

// 1. Iconography Audit: No generic Lucide icons in menu components
for (const relPath of menuFiles) {
  const fullPath = path.join(root, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (content.includes("from 'lucide-react'") || content.includes('from "lucide-react"')) {
      failures.push(`[ICON_AUDIT_FAIL] ${relPath} still imports generic icons from lucide-react.`);
    }
  } else {
    failures.push(`[FILE_MISSING] ${relPath} does not exist.`);
  }
}

// 2. Anti-Slop Audit: No neon cyan glows, no floating orange square, no sparkle icon
const playMedallionPath = path.join(root, 'src/components/menu/CenterPlayMedallion.tsx');
if (fs.existsSync(playMedallionPath)) {
  const content = fs.readFileSync(playMedallionPath, 'utf8');
  if (content.includes('from-sky-500/40') || content.includes('border-sky-300') || content.includes('blur-xl')) {
    failures.push('[ANTI_SLOP_FAIL] CenterPlayMedallion still contains neon cyan/blue blur glows.');
  }
  if (content.includes('bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow') && content.includes('Swords')) {
    failures.push('[ANTI_SLOP_FAIL] CenterPlayMedallion still contains floating glossy orange icon tile.');
  }
  if (content.includes('Sparkles')) {
    failures.push('[ANTI_SLOP_FAIL] CenterPlayMedallion still contains sparkle badge icon.');
  }
}

// 3. Bespoke Inline SVGs presence audit
const requiredSVGs = [
  'BrassCornerBracket',
  'PlayCrestIcon',
  'CollectionTomeIcon',
  'FriendsCrestIcon',
  'GoldCoinIcon',
  'BrassCogIcon',
];
let foundSVGs = 0;
for (const relPath of menuFiles.concat(['src/components/menu/MenuIcons.tsx'])) {
  const fullPath = path.join(root, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const svgName of requiredSVGs) {
      if (content.includes(svgName)) {
        foundSVGs++;
      }
    }
  }
}
if (foundSVGs < requiredSVGs.length) {
  failures.push(`[SVG_AUDIT_FAIL] Missing bespoke SVGs. Found ${foundSVGs} of ${requiredSVGs.length} required (${requiredSVGs.join(', ')}).`);
}

// 4. Textile Weave & Stitched Trim Audit in MainMenuScreen
const mainMenuPath = path.join(root, 'src/components/menu/MainMenuScreen.tsx');
if (fs.existsSync(mainMenuPath)) {
  const content = fs.readFileSync(mainMenuPath, 'utf8');
  if (!content.includes('feTurbulence')) {
    failures.push('[WEAVE_AUDIT_FAIL] MainMenuScreen missing static textile weave SVG filter (feTurbulence).');
  }
}

// 5. Zero external assets audit
for (const relPath of menuFiles) {
  const fullPath = path.join(root, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (/\.(png|jpe?g|webp|gif|avif)/i.test(content)) {
      failures.push(`[EXTERNAL_ASSET_FAIL] ${relPath} references external raster image assets.`);
    }
  }
}

console.log('--- HARNESS EXECUTION REPORT ---');
if (failures.length > 0) {
  console.log(`FAILS as expected with ${failures.length} issues:`);
  for (const f of failures) {
    console.log(` - ${f}`);
  }
  process.exit(1);
} else {
  console.log('PASS: All un-slop criteria, bespoke SVGs, and material fidelity verified!');
  process.exit(0);
}
