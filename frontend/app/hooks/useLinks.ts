import { useState, useCallback } from 'react';
import { LinkItem } from '../types';

export function useLinks(apiUrl: string) {
  const [links, setLinks] = useState<LinkItem[]>([]);

  const fetchLinks = useCallback(() => {
    fetch(`${apiUrl}/api/links`)
      .then(res => res.json())
      .then(setLinks)
      .catch(err => console.error('Fetch links error:', err));
  }, [apiUrl]);

  const addLink = async (title: string, url: string) => {
    if (!title || !url) return false;
    const res = await fetch(`${apiUrl}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url }),
    });
    if (res.ok) fetchLinks();
    return res.ok;
  };

  const deleteLink = async (id: number) => {
    await fetch(`${apiUrl}/api/links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  return { links, fetchLinks, addLink, deleteLink };
}
