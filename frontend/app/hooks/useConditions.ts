import { useState, useCallback } from 'react';
import { format } from 'date-fns';

export type ConditionEntry = {
  id?: number;
  date: string;
  weight: number;
  fat: number;
};

export function useConditions(apiUrl: string) {
  const [conditions, setConditions] = useState<ConditionEntry[]>([]);

  const fetchConditions = useCallback(() => {
    fetch(`${apiUrl}/api/conditions`)
      .then(res => res.json())
      .then((data: ConditionEntry[]) => {
        const formatted = data.map(item => ({
          ...item,
          date: format(new Date(item.date), 'MM/dd'),
        }));
        setConditions(formatted);
      })
      .catch(err => console.error('Fetch conditions error:', err));
  }, [apiUrl]);

  const addCondition = async (weight: number, fat: number, date: Date) => {
    const res = await fetch(`${apiUrl}/api/conditions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weight,
        fat,
        date: format(date, 'yyyy-MM-dd'),
      }),
    });
    if (res.ok) {
      alert(`${format(date, 'M月d日')}の記録を保存しました！`);
      fetchConditions();
    }
    return res.ok;
  };

  return { conditions, fetchConditions, addCondition };
}
