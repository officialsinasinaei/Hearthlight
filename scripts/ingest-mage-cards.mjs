import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function run() {
  console.log('Fetching 96 Standard Mage cards from Blizzard API...');
  const res = await fetch('https://hearthstone.blizzard.com/en-us/api/cards?class=mage&set=standard&pageSize=100');
  const data = await res.json();
  console.log(`Blizzard returned ${data.cards.length} cards.`);

  const rarityMap = {
    1: 'COMMON',
    2: 'FREE',
    3: 'RARE',
    4: 'EPIC',
    5: 'LEGENDARY',
  };

  const typeMap = {
    3: 'HERO',
    4: 'MINION',
    5: 'SPELL',
    7: 'WEAPON',
    10: 'LOCATION',
  };

  const normalized = data.cards.map((c) => {
    const rawRarity = rarityMap[c.rarityId] || 'COMMON';
    const rarity = rawRarity === 'FREE' ? 'COMMON' : rawRarity;
    const type = typeMap[c.cardTypeId] || 'SPELL';

    return {
      id: String(c.id),
      slug: c.slug || String(c.id),
      name: c.name.en_US,
      cost: c.manaCost ?? 0,
      attack: c.attack !== undefined ? c.attack : undefined,
      health: c.health !== undefined ? c.health : undefined,
      durability: c.durability !== undefined ? c.durability : undefined,
      type,
      rarity,
      cardClass: 'MAGE',
      text: c.text?.en_US || '',
      flavorText: c.flavorText?.en_US || '',
      imageUrl: c.image?.en_US || '',
      artEmoji: type === 'MINION' ? '🧙' : type === 'WEAPON' ? '🗡️' : type === 'LOCATION' ? '🏰' : '✨',
      artGradient:
        rarity === 'LEGENDARY'
          ? 'from-amber-400 via-yellow-500 to-amber-700'
          : rarity === 'EPIC'
          ? 'from-purple-500 via-indigo-600 to-slate-900'
          : rarity === 'RARE'
          ? 'from-sky-400 via-blue-600 to-indigo-900'
          : 'from-stone-500 via-slate-600 to-stone-800',
      keywords: [],
    };
  });

  // Sort canonically: Mana Cost ascending, then Name ascending
  normalized.sort((a, b) => {
    if (a.cost !== b.cost) return a.cost - b.cost;
    return a.name.localeCompare(b.name);
  });

  const outPath = path.join(root, 'src/engine/mage-cards.json');
  fs.writeFileSync(outPath, JSON.stringify(normalized, null, 2), 'utf8');
  console.log(`Saved ${normalized.length} normalized Mage cards to ${outPath}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
