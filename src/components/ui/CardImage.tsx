import { useState } from 'react';
import { CardDefinition } from '../../engine/types';
import { cn } from '../../utils/cn';

export interface CardImageProps {
  card: CardDefinition;
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
  size?: 'compact' | 'inspect';
  loading?: 'eager' | 'lazy';
}

export function CardImage({
  card,
  src,
  alt,
  className,
  imgClassName,
  size = 'compact',
  loading = 'eager',
}: CardImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imageSrc = src || `/art/cards/${card.id}.png`;
  const isInspect = size === 'inspect';

  return (
    <div className={cn('relative w-full h-full flex items-center justify-center', className)}>
      {/* Resilient Offline Fallback Canvas */}
      {status !== 'loaded' && (
        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-between overflow-hidden shadow-[0_6px_14px_rgba(0,0,0,0.85)] text-center',
            isInspect
              ? 'rounded-2xl p-4 bg-gradient-to-b from-[#2a170b] to-[#120803] border-3 border-[#8e6129]'
              : 'rounded-xl p-1.5 sm:p-2.5 bg-gradient-to-b from-[#2a1b12] to-[#120a05] border-2 border-[#8a6027]'
          )}
        >
          {/* Mana Oval */}
          <div
            className={cn(
              'rounded-full bg-gradient-to-b from-sky-400 to-blue-800 border text-white font-black flex items-center justify-center shadow',
              isInspect ? 'w-8 h-8 text-sm border-white' : 'w-6 h-6 sm:w-7 sm:h-7 text-xs border-sky-100'
            )}
          >
            {card.cost}
          </div>

          {/* Arcane Diamond Emblem */}
          <div className="my-auto text-center flex flex-col items-center">
            <div className={cn('relative flex items-center justify-center', isInspect ? 'w-8 h-8' : 'w-6 h-6 sm:w-7 sm:h-7')}>
              <svg className="w-full h-full text-[#93c5fd]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polygon points="12,2 22,12 12,22 2,12" stroke="currentColor" strokeWidth="1.2" />
                <polygon points="12,5 19,12 12,19 5,12" stroke="#60a5fa" strokeWidth="0.8" fill="rgba(59, 130, 246, 0.2)" />
                <circle cx="12" cy="12" r="2.5" fill="#93c5fd" />
                <circle cx="12" cy="12" r="1" fill="#ffffff" />
                <line x1="12" y1="2" x2="12" y2="6" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="12" y2="22" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="2" y1="12" x2="6" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="18" y1="12" x2="22" y2="12" stroke="#93c5fd" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className={cn('font-bold text-amber-100 mt-1 line-clamp-1', isInspect ? 'text-sm font-serif' : 'text-[10px] sm:text-xs')}>
              {card.name}
            </div>
          </div>

          {/* Card Text */}
          <div className={cn('text-stone-300 leading-tight bg-black/40 rounded p-0.5', isInspect ? 'text-[10px] px-2' : 'text-[8px] sm:text-[9px] line-clamp-2')}>
            <span dangerouslySetInnerHTML={{ __html: card.text }} />
          </div>
        </div>
      )}

      {/* Local Card Art Image */}
      <img
        src={imageSrc}
        alt={alt || card.name}
        loading={loading}
        decoding="sync"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={cn(
          'w-full h-full object-contain pointer-events-none transition-opacity duration-200',
          isInspect
            ? 'drop-shadow-[0_28px_50px_rgba(0,0,0,0.92)]'
            : 'drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]',
          status === 'loaded' ? 'opacity-100' : 'opacity-0 absolute inset-0',
          imgClassName
        )}
      />
    </div>
  );
}
