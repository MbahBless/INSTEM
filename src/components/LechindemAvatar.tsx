import React from "react";

interface LechindemAvatarProps {
  className?: string;
}

export default function LechindemAvatar({ className = "w-12 h-12" }: LechindemAvatarProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} rounded-full border border-yellow-500/40 shadow-lg shrink-0`}
    >
      {/* Background Gradient */}
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor="#1e1e24" />
          <stop offset="100%" stopColor="#0a0a0c" />
        </radialGradient>
        {/* Skin gradient */}
        <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9C6B43" />
          <stop offset="100%" stopColor="#5E3A1A" />
        </linearGradient>
        {/* Suit gradient - sharp premium charcoal black */}
        <linearGradient id="suit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>
        {/* Shirt gradient - elegant soft blue */}
        <linearGradient id="shirt" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="49" fill="url(#bgGlow)" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />

      {/* Head and Hair Base */}
      {/* Hair (neat short crop) */}
      <path d="M 33 41 C 33 21, 67 21, 67 41 C 67 43, 33 43, 33 41" fill="#09090b" />
      
      {/* Ears */}
      <circle cx="31.5" cy="48" r="4" fill="url(#skin)" />
      <circle cx="68.5" cy="48" r="4" fill="url(#skin)" />

      {/* Face */}
      <path d="M 34 41 Q 34 54 50 62 Q 66 54 66 41 L 66 41 Z" fill="url(#skin)" />

      {/* Neck */}
      <path d="M 44 59 L 44 68 L 56 68 L 56 59 Z" fill="url(#skin)" />

      {/* Eyes */}
      {/* Eye whites */}
      <ellipse cx="43.5" cy="44.5" rx="3.2" ry="1.6" fill="#ffffff" />
      <ellipse cx="56.5" cy="44.5" rx="3.2" ry="1.6" fill="#ffffff" />
      {/* Pupils */}
      <circle cx="43.5" cy="44.5" r="1.3" fill="#111" />
      <circle cx="56.5" cy="44.5" r="1.3" fill="#111" />
      {/* Highlights */}
      <circle cx="44" cy="43.8" r="0.5" fill="#ffffff" />
      <circle cx="57" cy="43.8" r="0.5" fill="#ffffff" />

      {/* Eyebrows */}
      <path d="M 39 41.2 Q 43.5 39.8 46.5 41.8" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 61 41.2 Q 56.5 39.8 53.5 41.8" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" />

      {/* Nose */}
      <path d="M 50 44 Q 48.5 50 50 51 Q 51.5 50 50 44" fill="none" stroke="#331A00" strokeWidth="1.2" strokeLinecap="round" />

      {/* Smiling Mouth */}
      <path d="M 41.5 52.5 Q 50 58.5 58.5 52.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 42.5 53 Q 50 57.5 57.5 53" stroke="#251605" strokeWidth="0.8" strokeLinecap="round" fill="none" />

      {/* Shirt Collar */}
      {/* Light blue shirt fabric showing beneath the chin and above the suit */}
      <path d="M 41 68 L 50 78 L 59 68 Z" fill="url(#shirt)" />
      {/* Collar flaps */}
      <path d="M 41 68 L 47 75 L 50 68 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="0.5" />
      <path d="M 59 68 L 53 75 L 50 68 Z" fill="#bae6fd" stroke="#7dd3fc" strokeWidth="0.5" />

      {/* Tie - Cameroon Flag styling directly from uploaded photo */}
      {/* Green left background stripe */}
      <path d="M 48 75 L 52 75 L 54 94 L 50 98 L 46 94 Z" fill="#047857" /> 
      {/* Red vertical center stripe */}
      <path d="M 49.3 75 L 50.7 75 L 51.5 94 L 50 97.5 L 48.5 94 Z" fill="#dc2626" />
      {/* Yellow right edge stripe */}
      <path d="M 51.3 75 L 52.3 75 L 54 94 L 51.5 95 Z" fill="#fbbf24" />
      {/* Gold star right over the red strip */}
      <polygon points="50,83 50.3,84.0 51.2,84.0 50.5,84.6 50.7,85.5 50,85.0 49.3,85.5 49.5,84.6 48.8,84.0 49.7,84.0" fill="#fbbf24" />

      {/* Suit/Coat Shoulder and Body */}
      {/* Left Shoulder */}
      <path d="M 12 88 C 12 72, 34 68, 41 71 L 44 80 L 30 100 L 12 100 Z" fill="url(#suit)" />
      {/* Right Shoulder */}
      <path d="M 88 88 C 88 72, 66 68, 59 71 L 56 80 L 70 100 L 88 100 Z" fill="url(#suit)" />
      
      {/* Coat Lapels */}
      <path d="M 41 71 L 45 80 L 34 100 H 24 Z" fill="#242428" stroke="#101012" strokeWidth="0.5" />
      <path d="M 59 71 L 55 80 L 66 100 H 76 Z" fill="#242428" stroke="#101012" strokeWidth="0.5" />
    </svg>
  );
}
