# Hearthlight Domain Glossary

This document establishes the canonical domain language for Hearthlight's collection, deck building, and matchmaking systems.

---

### Active Deck
The single validated 30-card deck selected for matchmaking and arena play.
- **Constraints**: Must contain exactly 30 cards. If only one 30-card deck exists in the player's collection, it is automatically designated as the Active Deck. If the current Active Deck is deleted, the system reassigns this status to the next available valid deck.
- **UI Representation**: Highlighted in the collection with a pulsing cyan/gold arcane border, an illuminated corner star emblem, and an `ACTIVE` badge.

### Incomplete Deck
A saved deck containing fewer than 30 cards (1–29 cards).
- **Constraints**: Cannot be designated as the Active Deck and cannot enter match play.
- **UI Representation**: Marked in the deck drawer with a red `Incomplete (X/30)` warning badge.

### Collector's Tome
The dual-page parchment grimoire interface displaying the player's card collection.
- **Constraints**: Displays strictly 8 cards per spread (4 cards on the left page, 4 cards on the right page).
- **Navigation**: Controlled via carved brass-and-walnut page-turn latch tabs, faceted mana crystal filters (0–7+), and real-time text search.

### Card Inspect Modal
A full-screen modal featuring an enlarged, 3D pointer-tilted presentation of a single card, its rules text, full stats, and narrative flavor text.
- **Contextual Actions**: When opened during Deck-Building Mode, displays interactive `+ Add to Deck` and `- Remove` controls.

### Copy Limit (Deck Limit)
The maximum number of copies of a single card allowed inside any one deck.
- **Rules**: Maximum 2 copies for Common, Rare, and Epic cards; maximum 1 copy for Legendary cards.
- **UI Representation**: Once a card reaches its copy limit inside an open deck, its grid slot displays a locked slate-and-brass plaque reading `Deck Limit: 2` (or `Deck Limit: 1`).

### Quick-Add
A direct `+` action button mounted beneath each card slot on the Collector's Tome in Deck-Building Mode, enabling rapid card selection without entering the inspect modal.

### Smart Deck Completion
An automated heuristic algorithm (`completeDeckSmart`) that fills remaining slots in an incomplete deck up to 30 cards, honoring copy limits and optimizing the Mage mana curve distribution.
