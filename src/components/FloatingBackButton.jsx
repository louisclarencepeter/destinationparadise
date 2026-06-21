import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function FloatingBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const segments = location.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  return (
    <button
      type="button"
      className="floating-back-btn"
      aria-label={t('back_button.aria')}
      onClick={() => navigate(-1)}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      <span className="floating-back-btn__label">{t('back_button.label')}</span>
    </button>
  );
}
