import { MOBILE_BACKEND_URL, WEBSITE_ORIGIN } from './config/endpoints';

export const colors = {
  background: '#071C2B',
  surface: '#0C2637',
  surfaceRaised: '#163447',
  border: '#294355',
  text: '#F7FAFC',
  textSecondary: '#C5D5DF',
  muted: '#96ADBC',
  coral: '#FF6F61',
  navy: '#071C2B',
  blue: '#315D77',
  success: '#8ED8B5',
  danger: '#FF9C91',
};

export const fonts = {
  sans: 'Montserrat',
  sansMedium: 'MontserratMedium',
  sansBold: 'MontserratBold',
  serif: 'PlayfairDisplay',
  script: 'KaushanScript',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const websiteUrl = WEBSITE_ORIGIN;
export const privacyPolicyUrl = `${MOBILE_BACKEND_URL}/mobile-privacy.html`;
