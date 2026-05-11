import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Schedule, GarbageType, garbageLabels } from '../types';

type Props = {
  currentMonth: Date;
  monthStart: Date;
  selectedDay: Date;
  calendarDays: Date[];
  holidays: string[];
  schedules: Schedule[];
  garbageDays: Record<string, GarbageType>;
  onSelectDay: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToggleHoliday: (e: React.MouseEvent, dateStr: string) => void;
  onSetGarbage: (dateStr: string, type: GarbageType) => void;
};

export default function Calendar({
  currentMonth,
  monthStart,
  selectedDay,
  calendarDays,
  holidays,
  schedules,
  garbageDays,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToggleHoliday,
  onSetGarbage,
}: Props) {
  return (
    <section className="bg-[#111827] rounded-sm shadow-2xl border-t-2 border-l-2 border-slate-700 relative">
      <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-emerald-500/50"></div>

      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-xl font-black text-white underline decoration-emerald-500 decoration-4 underline-offset-8">
          {format(currentMonth, 'yyyy / MM', { locale: ja })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-md transition-all text-white border border-slate-600"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-md transition-all text-white border border-slate-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 bg-slate-900/80">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
          <div
            key={day}
            className={`py-3 text-center text-[10px] font-bold tracking-widest border-r border-slate-800 last:border-r-0 ${
              i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 border-t border-slate-800">
        {calendarDays.map((date, i) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const garbageType = garbageDays[dateStr];
          const dateSchedules = schedules.filter(s => s.date === dateStr);
          const isSelected = isSameDay(date, selectedDay);
          const isCurrentMonth = isSameMonth(date, monthStart);
          const isToday = isSameDay(date, new Date());
          const isHoliday = holidays.includes(dateStr);

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDay(date)}
              className={`min-h-30 p-2 border-r border-b border-slate-800/80 transition-all cursor-pointer relative group
                ${!isCurrentMonth ? 'bg-black/40 opacity-30' : 'hover:bg-emerald-900/10'}
                ${isSelected ? 'bg-emerald-900/20 ring-1 ring-inset ring-emerald-500/50' : ''}
                ${isHoliday ? 'bg-red-950/40' : ''}
                ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
              `}
            >
              {/* 右上：休日ボタン */}
              <button
                onClick={e => onToggleHoliday(e, dateStr)}
                className={`absolute top-1 right-1 w-4 h-4 rounded-full border transition-all flex items-center justify-center z-20
                  ${
                    isHoliday
                      ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                      : 'bg-slate-800 border-slate-700 opacity-0 group-hover:opacity-100 hover:bg-red-900'
                  }`}
              >
                <span className="text-[8px] text-white font-black">{isHoliday ? 'OFF' : ''}</span>
              </button>

              {/* 日付表示 */}
              <div className="flex flex-col">
                <span
                  className={`text-sm font-bold w-fit
                    ${isToday ? 'bg-emerald-500 text-black px-1' : ''}
                    ${isHoliday ? 'text-red-400' : 'text-slate-300'}
                  `}
                >
                  {format(date, 'd')}
                </span>
                {isHoliday && (
                  <span className="text-[8px] font-black text-red-600 tracking-tighter mt-0.5">
                    OFF_DUTY
                  </span>
                )}
              </div>

              {/* スケジュール表示 */}
              <div className="mt-2 space-y-1">
                {dateSchedules.map(s => (
                  <div
                    key={s.id}
                    className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded-sm truncate
                      ${
                        s.category === '通知あり'
                          ? 'bg-red-950/80 text-red-400 border border-red-800'
                          : 'bg-slate-800/80 text-emerald-400 border border-emerald-900/50'
                      }`}
                  >
                    {s.category === '通知あり' && '!'} {s.title}
                  </div>
                ))}
              </div>

              {/* 左下：ごみの日タグ & プルダウン */}
              <div
                className="absolute bottom-1 left-1 flex flex-col gap-1 z-20"
                onClick={e => e.stopPropagation()}
              >
                {garbageType && (
                  <div className="bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                    <span className="animate-pulse">⚠️</span> {garbageLabels[garbageType]}
                  </div>
                )}
                <select
                  onChange={e => onSetGarbage(dateStr, e.target.value as GarbageType)}
                  value={garbageType || ''}
                  className="opacity-0 group-hover:opacity-100 bg-slate-900 border border-yellow-600 text-[8px] text-yellow-500 font-bold rounded-none outline-none cursor-pointer p-0.5 transition-opacity"
                >
                  <option value="" disabled>+ WASTE</option>
                  <option value="NON_BURNABLE">不燃 (NON-BURN)</option>
                  <option value="BATTERY">電池 (BATT)</option>
                  <option value="BOTTLE">ビン (BOTTLES)</option>
                  <option value="PAPER">紙 (PAPER)</option>
                  <option value="">(CLEAR)</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
