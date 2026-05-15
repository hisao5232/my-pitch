import { useState, useEffect, useCallback } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from 'date-fns';

export function useCalendar(apiUrl: string) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState<string[]>([]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // --- 追加：休日データの取得 ---
  const fetchHolidays = useCallback(async () => {
    console.log("🛠️ Requesting holidays from:", `${apiUrl}/api/holidays`);
    try {
      const res = await fetch(`${apiUrl}/api/holidays`);
      const data = await res.json();
      setHolidays(data);
    } catch (err) {
      console.error('Fetch holidays error:', err);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  // --- 修正：toggle時にAPIを叩く ---
  const toggleHoliday = async (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    
    // UIを即座に更新（楽観的更新）
    setHolidays(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );

    try {
      await fetch(`${apiUrl}/api/holidays/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      });
      // 念のため最新状態を再取得
      fetchHolidays();
    } catch (err) {
      console.error('Toggle holiday error:', err);
    }
  };

  return {
    currentMonth,
    selectedDay,
    setSelectedDay,
    holidays,
    calendarDays,
    monthStart,
    goToPrevMonth,
    goToNextMonth,
    toggleHoliday,
  };
}
