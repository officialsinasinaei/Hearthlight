import React from 'react';

/**
 * Strips raw HTML tags and converts <b> tags into bold highlighted spans
 */
export function formatCardText(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(<\/?b>)/gi);
  let isBold = false;
  return parts.map((part, i) => {
    const lower = part.toLowerCase();
    if (lower === '<b>') {
      isBold = true;
      return null;
    }
    if (lower === '</b>') {
      isBold = false;
      return null;
    }
    const cleaned = part.replace(/<[^>]+>/g, '');
    if (isBold) {
      return (
        <strong key={i} className="font-bold text-amber-200">
          {cleaned}
        </strong>
      );
    }
    return cleaned;
  });
}
