'use client';

import React from 'react';

export default function AnimatedBackground() {
  return (
    <div 
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-white"
    />
  );
}