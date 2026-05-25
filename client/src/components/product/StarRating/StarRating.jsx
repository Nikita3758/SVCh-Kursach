import { useState } from 'react';

const SIZE_MAP = { small: 16, medium: 22, large: 30 };

function Star({ state, size }) {
  // state: 'full' | 'half' | 'empty'
  const color = '#ffd700';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <defs>
        <linearGradient id={`star-half-${size}`}>
          <stop offset="50%" stopColor={color} />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={state === 'full' ? color : state === 'half' ? `url(#star-half-${size})` : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StarRating({ value, max = 5, editable = false, onChange, size = 'medium' }) {
  const [hovered, setHovered] = useState(null);
  const iconSize = SIZE_MAP[size];
  const displayValue = hovered !== null ? hovered : value;

  const stars = [];
  for (let i = 0; i < max; i++) {
    const filled = i < Math.floor(displayValue);
    const half = !filled && i < displayValue && displayValue - i >= 0.5;
    const state = filled ? 'full' : half ? 'half' : 'empty';
    const star = <Star state={state} size={iconSize} />;
    if (editable) {
      stars.push(
        <span
          key={i}
          className="star-rating__star"
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange?.(i + 1)}
        >
          {star}
        </span>,
      );
    } else {
      stars.push(<span key={i}>{star}</span>);
    }
  }

  return <div className="star-rating">{stars}</div>;
}
