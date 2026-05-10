import React from 'react';

/**
 * @param {React.ImgHTMLAttributes<HTMLImageElement> & {
 *   src?: string;
 *   alt?: string;
 *   fetchpriority?: string;
 * }} props
 */
export default function ResponsiveImage({ src, alt = '', fetchpriority, sizes, ...imageProps }) {
  const commonProps = { ...imageProps, src, alt, fetchpriority };

  if (typeof src !== 'string' || !src.endsWith('.webp')) {
    return (
      <img {...commonProps} />
    );
  }

  const srcSet = `${src.replace('.webp', '-600w.webp')} 600w, ${src} 1200w`;
  const resolvedSizes = sizes || '(max-width: 600px) 100vw, 1200px';

  return (
    <img
      {...commonProps}
      srcSet={srcSet}
      sizes={resolvedSizes}
    />
  );
}
