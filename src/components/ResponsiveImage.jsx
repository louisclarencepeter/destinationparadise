import React from 'react';

export default function ResponsiveImage({ src, alt, className, width, height, style, loading, decoding }) {
  if (!src || !src.endsWith('.webp')) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        style={style}
        loading={loading}
        decoding={decoding}
      />
    );
  }

  const srcSet = `${src.replace('.webp', '-600w.webp')} 600w, ${src} 1200w`;
  const sizes = '(max-width: 600px) 100vw, 1200px';

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      loading={loading}
      decoding={decoding}
    />
  );
}
