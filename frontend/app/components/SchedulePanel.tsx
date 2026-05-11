import React, { useState } from 'react';
import { Schedule } from '../types';

type Props = {
  selectedDay: Date;
  daySchedules: Schedule[];
  onAddSchedule: (
    title: string,
    description: string,
    date: Date,
    category: string
  ) => Promise<boolean>;
  onOpenEditModal: (schedule: Schedule) => void;
};

export default function SchedulePanel({
  selectedDay,
  daySchedules,
  onAddSchedule,
  onOpenEditModal,
}: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('通知なし');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const ok = await onAddSchedule(newTitle, newDescription, selectedDay, newCategory);
    if (ok) {
      setNewTitle('');
      setNewDescription('');
      setNewCategory('通知なし');
    }
  };

  return (
    <>
      {/* SIDE BLOCK 1: ENTRY FORM */}
      <div className="bg-[#111827] p-6 border-b-4 border-emerald-500 shadow-2xl">
        <h2 className="text-lg font-black mb-6 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span> Mission Entry
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group">
            <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">
              Category
            </label>
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:border-emerald-500 outline-none appearance-none"
            >
              <option value="通知なし">STANDARD</option>
              <option value="通知あり">URGENT / NOTIFY</option>
            </select>
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full p-2 bg-transparent border-b-2 border-slate-700 focus:border-emerald-500 outline-none text-white font-bold placeholder:text-slate-700"
            placeholder="MISSION TITLE"
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            className="w-full p-2 bg-slate-900/50 border border-slate-800 text-sm h-24 focus:border-emerald-500 outline-none text-slate-400"
            placeholder="Details and tactical notes..."
          />
          <button className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-500 border border-emerald-500/50 py-3 font-bold text-xs uppercase tracking-[0.2em] transition-all">
            Add to Briefing
          </button>
        </form>
      </div>

      {/* SIDE BLOCK 2: DAILY BRIEFING */}
      <div className="bg-transparent border border-slate-800 p-6 shadow-lg">
        <h2 className="text-lg font-black mb-4 uppercase italic text-slate-400">Daily Briefing</h2>
        <div className="space-y-4">
          {daySchedules.length > 0 ? (
            daySchedules.map(item => (
              <div
                key={item.id}
                className="p-4 bg-slate-900/40 border border-slate-800 border-l-4 border-l-emerald-600 group relative"
              >
                <div className="font-bold text-white text-md uppercase tracking-tight">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </div>
                <button
                  onClick={() => onOpenEditModal(item)}
                  className="absolute -top-2 -right-2 bg-emerald-500 text-[#0a0f1e] p-1 px-2 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all"
                >
                  EDIT_UNIT
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-700 text-xs font-bold tracking-widest text-center py-6 border border-dashed border-slate-800">
              NO MISSIONS PLANNED
            </p>
          )}
        </div>
      </div>
    </>
  );
}
