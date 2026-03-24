import React from 'react';

export default function LogoIcon({ className, size = 24, strokeWidth = 5 }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size} 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M28 15h32l22 22v8" />
      <path d="M60 15v22h22" />
      <path d="M82 72v8" />
      <path d="M28 15v63" />
      
      <line x1="38" y1="35" x2="54" y2="35" />
      <line x1="38" y1="45" x2="58" y2="45" />
      <line x1="38" y1="55" x2="58" y2="55" />
      <line x1="38" y1="65" x2="58" y2="65" />
      
      <path d="M28 78c-12 0-16 10-6 10h44c10 0 16-10 16-10" />
      
      <circle cx="76" cy="58" r="15" fill="none" />
      <path d="M76 48v20" />
      <path d="M72 52c0-3 8-3 4-1c-4 2 4 4 4 7c0 3-8 3-8 1" />
    </svg>
  );
}
