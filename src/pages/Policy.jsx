import Placeholder from '../components/Placeholder.jsx';

const TITLES = {
  cookies: 'Cookies policy',
  privacy: 'Privacy policy',
  terms: 'Terms of service',
};

export default function Policy({ section = 'privacy' }) {
  return <Placeholder eyebrow="Legal" title={TITLES[section] || 'Policy'} lead="Policy text will live here. Drop the canonical copy in and we'll style it to match the design system." />;
}
