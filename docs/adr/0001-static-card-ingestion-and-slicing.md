# 1. Offline Static Card Ingestion and Client-Side Page Slicing

Date: 2026-11-15

## Status

Accepted

## Context

Standard Hearthstone card data can be sourced from official Blizzard web pages, public community APIs, or pre-compiled datasets. The official card library is a dynamic Single-Page Application (SPA) loading data asynchronously via private endpoints, making runtime scraping brittle, slow, and prone to empty shells or CORS blocks.

Furthermore, rendering all 96 high-resolution card DOM nodes simultaneously causes excessive memory usage, layout thrashing, and dropped frames during page-turn animations on lower-end devices.

## Decision

1. Ingest and compile the 96 Standard Mage cards into a local, offline static dataset (`src/engine/mage-cards.json`), complete with card IDs, mana costs, attack, health, rules text, flavor text, and image paths.
2. Enforce strict DOM slicing: The Collector's Tome mounts strictly 8 cards per view (4 on the left page, 4 on the right page). Adjacent page images are preloaded in the background.

## Consequences

### Positive
- Zero runtime network dependency for card metadata; instant boot and zero API rate limits.
- Guaranteed 60 FPS page flips with constant low DOM memory overhead.
- Deterministic test harness and offline headless testing.

### Negative
- Updates to Standard card balance or text require re-running the ingest script rather than pulling dynamically from live servers.
