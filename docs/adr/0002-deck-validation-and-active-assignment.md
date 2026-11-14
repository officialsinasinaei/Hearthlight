# 2. Deck Validation, Incomplete Exit Interception, and Active Deck Assignment

Date: 2026-11-15

## Status

Accepted

## Context

In Hearthlight, entering match play requires a full 30-card deck. Players creating or editing custom decks will frequently exit the editor before completing all 30 slots. Without graceful interception, players risk either:
1. Accidental data loss or confusing incomplete saves.
2. Attempting to enter matchmaking with an invalid deck (< 30 cards).
3. Having an undefined or orphaned Active Deck when decks are edited or deleted.

## Decision

1. **Incomplete Exit Interception**:
   When a player clicks "Done" on a deck with fewer than 30 cards, the system presents an explicit confirmation modal:
   - "Finish Automatically (30/30)": Executes the heuristic `completeDeckSmart` algorithm and saves.
   - "Save as Incomplete": Retains the incomplete deck in the player's collection.
   - "Keep Editing": Cancels the exit.
2. **Incomplete Deck State & Constraints**:
   - Incomplete decks display a high-visibility crimson warning badge `Incomplete (X/30)` in the "My Decks" drawer.
   - Setting an incomplete deck as the Active Deck is hard-disabled.
3. **Single-Deck Auto-Activation & Reassignment**:
   - If only one valid (30/30) deck exists in the player's collection, it is automatically assigned as `activeDeckId`.
   - If the currently active deck is deleted or reduced below 30 cards, the store immediately falls back to the next available valid 30-card deck (or `null` if none remain).
   - In the Deck Editor, the Active Deck displays a locked gold/arcane badge: `★ Active Deck`.

## Consequences

### Positive
- Players never accidentally lose in-progress deck designs.
- Impossible to enter match play with an incomplete deck.
- Single valid decks activate without redundant clicks.
