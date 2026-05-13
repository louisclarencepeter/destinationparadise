import { useEffect } from 'react';
import Placeholder from '../components/Placeholder.jsx';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found · Destination Paradise';
  }, []);

  return <Placeholder eyebrow="404" title="Lost at sea" lead="That page isn't on the map. Head back to the homepage and pick a route." />;
}
