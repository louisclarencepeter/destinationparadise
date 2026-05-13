import { useLocation, useNavigate } from 'react-router-dom';

export default function FloatingBackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  return (
    <button
      type="button"
      className="floating-back-btn"
      aria-label="Go back to previous page"
      onClick={() => navigate(-1)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span className="floating-back-btn__label">Back</span>
    </button>
  );
}
