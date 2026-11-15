/**
 * Shared helper for mapping screen client coordinates to logical stage coordinates.
 * When .landscape-forced-portrait (90deg clockwise CSS rotation) is active,
 * screen (clientX, clientY) maps to:
 * stageX = clientY
 * stageY = window.innerWidth - clientX
 */
export function normalizePointerCoords(
  clientX: number,
  clientY: number,
  isForcedPortrait = false
): { x: number; y: number } {
  if (isForcedPortrait) {
    return {
      x: clientY,
      y: window.innerWidth - clientX,
    };
  }
  return {
    x: clientX,
    y: clientY,
  };
}

/**
 * Extracts normalized stage coordinates from mouse, touch, or pointer events.
 */
export function getStagePointerCoords(
  e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent | React.PointerEvent,
  isForcedPortrait = false
): { x: number; y: number } {
  let clientX = 0;
  let clientY = 0;

  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('changedTouches' in e && (e.changedTouches as TouchList).length > 0) {
    clientX = (e.changedTouches as TouchList)[0].clientX;
    clientY = (e.changedTouches as TouchList)[0].clientY;
  } else if ('clientX' in e && typeof e.clientX === 'number') {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return normalizePointerCoords(clientX, clientY, isForcedPortrait);
}
