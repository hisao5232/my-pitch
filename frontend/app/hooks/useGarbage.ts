import { useState, useCallback } from 'react';
import { GarbageType } from '../types';

export function useGarbage(apiUrl: string) {
  const [garbageDays, setGarbageDays] = useState<Record<string, GarbageType>>({});

  const fetchGarbageData = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/garbage`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const garbageMap = data.reduce(
        (acc: Record<string, GarbageType>, item: { date: string; type: GarbageType }) => {
          acc[item.date] = item.type;
          return acc;
        },
        {}
      );
      setGarbageDays(garbageMap);
    } catch (err) {
      console.error('Failed to load garbage data:', err);
    }
  }, [apiUrl]);

  const setGarbage = async (dateStr: string, type: GarbageType) => {
    setGarbageDays(prev => ({ ...prev, [dateStr]: type }));
    try {
      const response = await fetch(`${apiUrl}/api/garbage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, type }),
      });
      if (!response.ok) throw new Error('Failed to sync');
    } catch (error) {
      console.error('Garbage sync error:', error);
    }
  };

  return { garbageDays, fetchGarbageData, setGarbage };
}
