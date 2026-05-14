import { useEffect } from 'react';
import Placeholder from '../components/Placeholder.jsx';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Nie znaleziono strony · Destination Paradise';
  }, []);

  return <Placeholder eyebrow="404" title="Zgubiliśmy kurs" lead="Tej strony nie ma na mapie. Wróć na stronę główną i wybierz trasę." />;
}
