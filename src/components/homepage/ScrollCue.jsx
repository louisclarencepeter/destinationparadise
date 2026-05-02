export default function ScrollCue({ to, label = 'Scroll', variant = 'section', className = '' }) {
  const href = to ? `#${to}` : '#';
  const rootClass = variant === 'hero' ? 'hero__scroll' : 'scroll-cue';
  const lineClass = variant === 'hero' ? 'hero__scroll-line' : 'scroll-cue__line';

  return (
    <a className={`${rootClass} ${className}`.trim()} href={href} aria-label={`Scroll to ${label}`}>
      <span>{label}</span>
      <span className={lineClass} aria-hidden="true"></span>
    </a>
  );
}
