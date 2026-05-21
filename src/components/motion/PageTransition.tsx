import React from 'react';

/** Tanpa animasi route — konten langsung tampil (cepat, tidak ada elemen tertahan) */
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full">{children}</div>
);
