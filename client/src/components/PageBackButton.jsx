import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import './PageBackButton.css';

const validPlacements = new Set([
  'inside',
  'edge',
  'compact',
  'inline',
]);

export default function PageBackButton({
  onClick,
  label = 'Назад',
  placement = 'inside',
  className = '',
  disabled = false,
}) {
  const safePlacement = validPlacements.has(placement)
    ? placement
    : 'inside';

  return (
    <div
      className={[
        'pageBackControl',
        `pageBackControl--${safePlacement}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <motion.button
        className="pageBackButton"
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        whileHover={
          disabled
            ? undefined
            : {
                x: -2,
              }
        }
        whileTap={
          disabled
            ? undefined
            : {
                scale: 0.94,
              }
        }
        transition={{
          duration: 0.18,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <span
          className="pageBackButton__glow"
          aria-hidden="true"
        />

        <span
          className="pageBackButton__shine"
          aria-hidden="true"
        />

        <span className="pageBackButton__icon">
          <ArrowLeft
            size={18}
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </span>

        <span
          className="pageBackButton__tooltip"
          aria-hidden="true"
        >
          {label}
        </span>
      </motion.button>
    </div>
  );
}
