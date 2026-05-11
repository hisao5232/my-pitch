import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Schedule } from '../types';

export function useSchedules(apiUrl: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const fetchSchedules = useCallback(() => {
    fetch(`${apiUrl}/api/schedules`)
      .then(res => res.json())
      .then(setSchedules)
      .catch(err => console.error('Fetch schedules error:', err));
  }, [apiUrl]);

  const addSchedule = async (
    title: string,
    description: string,
    date: Date,
    category: string
  ) => {
    const res = await fetch(`${apiUrl}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        date: format(date, 'yyyy-MM-dd'),
        category,
      }),
    });
    if (res.ok) fetchSchedules();
    return res.ok;
  };

  const updateSchedule = async (
    id: number,
    title: string,
    description: string,
    date: string
  ) => {
    const res = await fetch(`${apiUrl}/api/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, date }),
    });
    if (res.ok) {
      fetchSchedules();
    } else {
      alert('更新に失敗しました');
    }
    return res.ok;
  };

  const deleteSchedule = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return false;
    const res = await fetch(`${apiUrl}/api/schedules/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchSchedules();
    } else {
      alert('削除に失敗しました');
    }
    return res.ok;
  };

  return { schedules, fetchSchedules, addSchedule, updateSchedule, deleteSchedule };
}
