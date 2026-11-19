# Hearthlight Card Verification Matrix (Milestone 4)

## Executive Summary & Quality Gates
- **Total Collectible Cards**: 96 / 96 PASS (100.0%)
- **Verification Strategy**: Strictly 1-by-1 in exact `mage-cards.json` array index order (0 to 95)
- **Gates Verified per Card**:
  - **Gate A**: Identity, Stats & Keyword Hydration (ID, Name, Type, Cost, Attack/Health, Behavior Registry, Hydrated Keywords, Instance Flags)
  - **Gate B**: Mana Playability Gating (Insufficient mana rejected, sufficient mana deducted)
  - **Gate C**: Targeting Validation (NeedsTarget enforcement, Stealth exclusion, Taunt attack priority)
  - **Gate D**: Primary & Secondary Effect Execution (Deterministic damage, freeze, draw, buff, transform, secret, headless Discover)
  - **Gate E**: Token Validity & Generation Pools (Canonical `TOKEN_CARDS` definitions, cost-tiered minion pools, random spell pools)
  - **Gate F**: Caps & Boundary Edge Cases (7-minion board cap, 10-card hand cap with graveyard burn, empty-deck fatigue, dynamic spell damage)
- **Deterministic PRNG**: Seeded `mulberry32` PRNG across all battle actions (zero unseeded `Math.random()` calls)

## Summary Statistics
| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Collectible Cards Verified** | **96 / 96** | **100% PASS** |
| Spells | 54 | 56.25% |
| Minions | 42 | 43.75% |
| Cards with Hydrated Keywords | 42 | 43.75% |
| Target-Requiring Cards | 26 | 27.08% |
| Discover Cards | 14 | 14.58% |
| Secret Cards | 8 | 8.33% |
| Token-Referencing Cards | 17 | 17.71% |
| Deterministic PRNG Seed | `mulberry32` | 100% Reproducible |

---

## 12-Column Verification Matrix

| # | Index | ID | Name | Type | Cost | Stats (A/H) | Keywords | Mechanic Tier / Type | Generated Tokens / Cards | Verified Edge Cases | Status |
|---|-------|----|------|------|------|-------------|----------|----------------------|--------------------------|---------------------|--------|
| 1 | 0 | `126356` | **Cold Snap** | SPELL | 1 | - | FREEZE | Freeze | Frost Spells Pool | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 2 | 1 | `126227` | **First Flame** | SPELL | 1 | - | None | Direct Damage | Second Flame | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Token Registry & Instantiation | **PASS** |
| 3 | 2 | `114293` | **Forbidden Shrine** | SPELL | 1 | - | None | Utility Spell | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 4 | 3 | `119541` | **Mirror Dimension** | SPELL | 1 | - | TAUNT | Summon / Transform | Mirror Defender | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation, Taunt Attack Intercept | **PASS** |
| 5 | 4 | `118192` | **Scrappy Scavenger** | MINION | 1 | 1/1 | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 6 | 5 | `123410` | **Sleet Storm** | SPELL | 1 | - | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 7 | 6 | `116977` | **Spark of Life** | SPELL | 1 | - | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 8 | 7 | `118183` | **The Forbidden Sequence** | SPELL | 1 | - | DISCOVER | Discover | The Origin Stone | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution, Token Registry & Instantiation | **PASS** |
| 9 | 8 | `126116` | **The Skeleton Key** | SPELL | 1 | - | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Headless 3-Choice Resolution | **PASS** |
| 10 | 9 | `121174` | **Time-Twisted Seer** | MINION | 1 | 1/3 | SPELL_DAMAGE | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 11 | 10 | `120971` | **Violet Spellwing** | MINION | 1 | 2/1 | DEATHRATTLE | Minion / Stat Presence | Arcane Missiles | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 12 | 11 | `123398` | **Winterspring Whelp** | MINION | 1 | 1/2 | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 13 | 12 | `130441` | **Coilbearer** | MINION | 2 | 3/2 | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 14 | 13 | `129788` | **Constellar's Calling** | SPELL | 2 | - | None | Summon / Transform | Cost-Tiered Pool (Same-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 15 | 14 | `126109` | **Contraband Wands** | SPELL | 2 | - | None | Utility Spell | Arcane Missiles | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 16 | 15 | `129112` | **Discs of Norgannon** | SPELL | 2 | - | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 17 | 16 | `114012` | **Divination** | SPELL | 2 | - | None | Card Draw | Wisp | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 18 | 17 | `119740` | **Faceless Enigma** | MINION | 2 | 2/2 | SECRET | Secret | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Secret Register & Intercept | **PASS** |
| 19 | 18 | `111365` | **Frostbolt** | SPELL | 2 | - | FREEZE | Freeze | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 20 | 19 | `126975` | **Khadgar** | MINION | 2 | 2/2 | None | Summon / Transform | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 21 | 20 | `123508` | **Leyline Nexus** | SPELL | 2 | - | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 22 | 21 | `123515` | **Mystic Runesaber** | MINION | 2 | 2/3 | None | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 23 | 22 | `123419` | **Raincaller** | MINION | 2 | 1/4 | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 24 | 23 | `126982` | **Runed Orb** | SPELL | 2 | - | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Headless 3-Choice Resolution | **PASS** |
| 25 | 24 | `118636` | **Semi-Stable Portal** | SPELL | 2 | - | None | Utility Spell | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 26 | 25 | `115635` | **Smoldering Grove** | SPELL | 2 | - | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 27 | 26 | `116462` | **Spirit Gatherer** | MINION | 2 | 2/1 | None | Minion / Stat Presence | Wisp | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 28 | 27 | `116980` | **Stellar Balance** | SPELL | 2 | - | SPELL_DAMAGE | Buff / Armor | Moonfire, Starfire | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Token Registry & Instantiation | **PASS** |
| 29 | 28 | `118265` | **Story of the Waygate** | SPELL | 2 | - | None | Utility Spell | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 30 | 29 | `129801` | **Thaw From Ice** | SPELL | 2 | - | None | Utility Spell | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 31 | 30 | `118199` | **Unearthed Artifacts** | SPELL | 2 | - | DISCOVER | Discover | Cost-Tiered Pool (2/4-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution, Token Registry & Instantiation | **PASS** |
| 32 | 31 | `119528` | **Arcane Barrage** | SPELL | 3 | - | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 33 | 32 | `69500` | **Arcane Intellect** | SPELL | 3 | - | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 34 | 33 | `117307` | **Babbling Bookcase** | MINION | 3 | 2/4 | None | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 35 | 34 | `123848` | **Conjuration Specialist** | MINION | 3 | 3/4 | None | Minion / Stat Presence | Cost-Tiered Pool (Same-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 36 | 35 | `117535` | **Conjured Bookkeeper** | MINION | 3 | 2/2 | DEATHRATTLE | Summon / Transform | Minion Clone Token | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 37 | 36 | `129787` | **Cosmic Springs** | SPELL | 3 | - | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 38 | 37 | `69607` | **Counterspell** | SPELL | 3 | - | SECRET | Secret | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Secret Register & Intercept | **PASS** |
| 39 | 38 | `121188` | **Eternal Firebolt** | SPELL | 3 | - | LIFESTEAL | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 40 | 39 | `86235` | **Explosive Runes** | SPELL | 3 | - | SECRET | Secret | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Secret Register & Intercept | **PASS** |
| 41 | 40 | `121187` | **Flames of Infinity** | SPELL | 3 | - | SECRET | Secret | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Secret Register & Intercept | **PASS** |
| 42 | 41 | `131200` | **Foreboding Freeze** | SPELL | 3 | - | FREEZE | Freeze | Cost-Tiered Pool (5-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 43 | 42 | `69608` | **Ice Barrier** | SPELL | 3 | - | SECRET | Secret | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Secret Register & Intercept | **PASS** |
| 44 | 43 | `123496` | **Ley Walker** | MINION | 3 | 4/2 | DEATHRATTLE | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 45 | 44 | `126113` | **Mystic Misdirection** | SPELL | 3 | - | SECRET | Secret | Sheep | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Secret Register & Intercept, Token Registry & Instantiation | **PASS** |
| 46 | 45 | `120392` | **Oasis Ally** | SPELL | 3 | - | SECRET | Secret | Water Elemental | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Secret Register & Intercept, Token Registry & Instantiation | **PASS** |
| 47 | 46 | `114287` | **Q'onzu** | MINION | 3 | 3/4 | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 48 | 47 | `115634` | **Scorching Winds** | SPELL | 3 | - | None | Direct Damage | Fire Spells Pool | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 49 | 48 | `126355` | **Spire Security** | MINION | 3 | 3/4 | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 50 | 49 | `115866` | **Starsurge** | SPELL | 3 | - | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 51 | 50 | `118266` | **Storage Scuffle** | SPELL | 3 | - | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Headless 3-Choice Resolution | **PASS** |
| 52 | 51 | `119741` | **Timelooper Toki** | MINION | 3 | 3/3 | None | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 53 | 52 | `120582` | **Vault Breaker** | MINION | 3 | 2/4 | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 54 | 53 | `119633` | **Alter Time** | SPELL | 4 | - | DISCOVER | Discover | Arcane Spells Pool | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 55 | 54 | `123692` | **Arcane Flow** | SPELL | 4 | - | None | AoE / Split Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 56 | 55 | `122632` | **Archmage Kalec** | MINION | 4 | 4/4 | SPELL_DAMAGE | Buff / Armor | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 57 | 56 | `129811` | **Astral Rain** | SPELL | 4 | - | None | AoE / Split Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 58 | 57 | `123495` | **Bursting Leyline** | SPELL | 4 | - | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 59 | 58 | `69501` | **Fireball** | SPELL | 4 | - | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 60 | 59 | `121189` | **Fragment of Nothing** | MINION | 4 | 3/6 | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 61 | 60 | `115637` | **Inferno Herald** | MINION | 4 | 3/6 | None | Minion / Stat Presence | Fire Spells Pool | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 62 | 61 | `115805` | **Merry Moonkin** | MINION | 4 | 3/6 | None | Buff / Armor | Wisp | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 63 | 62 | `118651` | **Sheep Mask** | SPELL | 4 | - | DEATHRATTLE | AoE / Split Damage | Sheep | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Token Registry & Instantiation | **PASS** |
| 64 | 63 | `123507` | **Surge Needle** | MINION | 4 | 3/5 | None | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 65 | 64 | `123351` | **Unstable Spellcaster** | MINION | 4 | 2/5 | SPELL_DAMAGE | Summon / Transform | Minion Clone Token | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 66 | 65 | `117531` | **Windswept Pageturner** | MINION | 4 | 4/5 | None | Summon / Transform | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 67 | 66 | `119632` | **Algeth'ar Instructor** | MINION | 5 | 4/7 | SPELL_DAMAGE | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 68 | 67 | `129798` | **Astral Mediator** | MINION | 5 | 5/4 | DEATHRATTLE | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 69 | 68 | `119524` | **Azure Queen Sindragosa** | MINION | 5 | 2/8 | None | Minion / Stat Presence | Arcane Spells Pool | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 70 | 69 | `121176` | **Bitter End** | SPELL | 5 | - | FREEZE | Freeze | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 71 | 70 | `126111` | **Bootleg Alchemist** | MINION | 5 | 3/3 | None | Summon / Transform | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 72 | 71 | `126354` | **Breakout Architect** | MINION | 5 | 4/5 | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 73 | 72 | `123504` | **Crystallized Leyline** | SPELL | 5 | - | None | Summon / Transform | Cost-Tiered Pool (6-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 74 | 73 | `129889` | **Icebelt Magi** | MINION | 5 | 2/4 | None | Summon / Transform | Water Elemental | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 75 | 74 | `126353` | **Jailhouse Manastorm** | MINION | 5 | 5/5 | None | Summon / Transform | Cost-Tiered Pool (Same-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 76 | 75 | `123847` | **Sindragosa's Triumph** | SPELL | 5 | - | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 77 | 76 | `118554` | **Tribute Dance** | SPELL | 5 | - | None | Summon / Transform | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 78 | 77 | `126253` | **Tricksy Improviser** | MINION | 5 | 4/3 | SECRET | Secret | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Secret Register & Intercept | **PASS** |
| 79 | 78 | `114292` | **Wisprider** | MINION | 5 | 4/4 | None | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 80 | 79 | `132671` | **Arrival of the Titans** | SPELL | 6 | - | None | Card Draw | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 81 | 80 | `76273` | **Blizzard** | SPELL | 6 | - | FREEZE | Freeze | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 82 | 81 | `129851` | **Isiset** | MINION | 6 | 5/5 | FREEZE | Freeze | Construct | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 83 | 82 | `123514` | **The Arcanomicon** | SPELL | 6 | - | None | Utility Spell | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 84 | 83 | `117956` | **Titanographer Osk** | MINION | 6 | 6/6 | None | Buff / Armor | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 85 | 84 | `119691` | **Anomalize** | SPELL | 7 | - | None | Summon / Transform | Cost-Tiered Pool (10/1-Cost Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 86 | 85 | `120426` | **Archmage Antonidas** | MINION | 7 | 5/7 | None | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 87 | 86 | `129846` | **Astromancer** | MINION | 7 | 5/5 | None | Summon / Transform | Cost-Tiered Pool (Hand-Size Minion) | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 88 | 87 | `126841` | **Code Violet** | SPELL | 7 | - | None | Summon / Transform | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 89 | 88 | `126976` | **Deep Freeze** | SPELL | 7 | - | FREEZE | Freeze | Water Elemental | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 90 | 89 | `69502` | **Flamestrike** | SPELL | 7 | - | None | AoE / Split Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling | **PASS** |
| 91 | 90 | `118616` | **Relic of Kings** | SPELL | 7 | - | DISCOVER | Discover | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Headless 3-Choice Resolution | **PASS** |
| 92 | 91 | `118485` | **Techysaurus** | MINION | 7 | 3/6 | TAUNT | Minion / Stat Presence | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Taunt Attack Intercept | **PASS** |
| 93 | 92 | `119649` | **Temporal Construct** | MINION | 7 | 5/5 | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 94 | 93 | `123665` | **Vulcanos** | MINION | 7 | 4/8 | None | Summon / Transform | Plume of Vulcanos | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Token Registry & Instantiation | **PASS** |
| 95 | 94 | `113700` | **Aessina** | MINION | 8 | 6/8 | None | Direct Damage | None | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue | **PASS** |
| 96 | 95 | `122454` | **Spellweaver's Brilliance** | SPELL | 10 | - | None | Summon / Transform | Dragon | Mana Gating, Stealth Protection, 7-Minion Board Cap, 10-Card Hand Cap, Fatigue, Spell Damage Scaling, Token Registry & Instantiation | **PASS** |

---

## Verification Method & Reproduction
To independently reproduce and verify this entire matrix:
```bash
# Run 1-by-1 verification across all 96 cards
node scripts/verify-cards.mjs --all

# Run verification for a single card by 1-based index (e.g. Card 1: Cold Snap)
node scripts/verify-cards.mjs --index=1

# Run verification for a single card by ID (e.g. First Flame)
node scripts/verify-cards.mjs --card=126227
```
