import { useEffect } from 'react';

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', description);
      return;
    }

    const nextMeta = document.createElement('meta');
    nextMeta.name = 'description';
    nextMeta.content = description;
    document.head.appendChild(nextMeta);
  }, [description, title]);
}
