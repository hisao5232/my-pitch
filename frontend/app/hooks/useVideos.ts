import { useState, useCallback } from 'react';
import { VideoItem } from '../types';

export function useVideos(apiUrl: string) {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  const fetchVideos = useCallback(() => {
    fetch(`${apiUrl}/api/videos`)
      .then(res => res.json())
      .then(setVideos)
      .catch(err => console.error('Fetch videos error:', err));
  }, [apiUrl]);

  const addVideo = async (title: string, url: string) => {
    if (!title || !url) return false;
    const res = await fetch(`${apiUrl}/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, category: 'サッカー' }),
    });
    if (res.ok) fetchVideos();
    return res.ok;
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'www.youtube.com/embed/');
    }
    return url;
  };

  return { videos, fetchVideos, addVideo, getEmbedUrl };
}
