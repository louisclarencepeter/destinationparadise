import React from 'react';
import imageManifest from '../data/imageManifest.json';

/**
 * @param {React.ImgHTMLAttributes<HTMLImageElement> & {
 *   src?: string;
 *   alt?: string;
 *   fetchpriority?: string;
 * }} props
 */
export default function ResponsiveImage({ src, alt = '', fetchpriority, sizes, width, height, ...imageProps }) {
  if (typeof src !== 'string' || !src.endsWith('.webp')) {
    return <img {...imageProps} src={src} alt={alt} fetchpriority={fetchpriority} width={width} height={height} />;
  }

  const meta = imageManifest[src];
  // Fall back to the old behavior for any unknown image so the build still works.
  const fullWidth = meta?.w ?? 1200;
  const fullHeight = meta?.h;
  const smallWidth = meta?.smallW;

  const srcSetParts = [];
  if (smallWidth && smallWidth < fullWidth) {
    const smallSrc = src.replace(/\.webp$/, '-600w.webp');
    srcSetParts.push(`${smallSrc} ${smallWidth}w`);
  }
  srcSetParts.push(`${src} ${fullWidth}w`);

  const resolvedSizes = sizes || '(max-width: 600px) 100vw, 1200px';

  return (
    <img
      {...imageProps}
      src={src}
      alt={alt}
      fetchpriority={fetchpriority}
      width={width ?? fullWidth}
      height={height ?? fullHeight}
      srcSet={srcSetParts.join(', ')}
      sizes={resolvedSizes}
    />
  );
}
