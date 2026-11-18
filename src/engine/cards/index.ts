import { MAGE_CARDS } from '../cards.ts';
import { validateCardRegistry } from './registry.ts';
import './behaviors/index.ts';

// Execute exhaustiveness validation at module initialization time.
// Guarantees zero silent fallbacks in runtime execution.
validateCardRegistry(MAGE_CARDS);

export * from './types.ts';
export * from './registry.ts';
export * from './primitives.ts';
export * from './tokenRegistry.ts';
