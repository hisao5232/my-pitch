import React, { useState, useEffect } from 'react';
import { Schedule } from '../types';

type Props = {
  schedule: Schedule | null;
  onUpdate: (id: number, title: string, description: string, date: string) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  onClose: () => void;
};

export default function EditModal({ schedule, onUpdate, onDelete, onClose }: Props) {
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    if (schedule) {
      setEditTitle(schedule.title);
      setEditDescription(schedule.description);
    }
  }, [schedule]);

  if (!schedule) return null;

  const handleUpdate = async () => {
    const ok = await onUpdate(schedule.id, editTitle, editDescription, schedule.date);
    if (ok) onClose();
  };

  const handleDelete = async () => {
    const ok = await onDelete(schedule.id);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0a0f1e]/90 backdrop-blur-md flex items-center justify-center z-100 p-4">
      <div className="bg-[#111827] w-full max-w-md p-8 border-t-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        <h2 className="text-2xl font-black mb-6 text-white uppercase italic tracking-tighter">
          Edit Mission
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Objective Title
            </label>
            <input
              className="w-full p-3 bg-black border border-slate-700 text-emerald-400 font-bold outline-none focus:border-emerald-500"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">
              Strategic Details
            </label>
            <textarea
              className="w-full p-3 bg-black border border-slate-700 text-slate-400 text-sm h-32 outline-none focus:border-emerald-500"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={handleUpdate}
              className="bg-emerald-600 hover:bg-emerald-500 text-[#0a0f1e] py-3 font-black text-sm uppercase"
            >
              Confirm
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-950 text-red-500 border border-red-900 py-3 font-bold text-sm uppercase"
            >
              Abort Unit
            </button>
            <button
              onClick={onClose}
              className="col-span-2 bg-slate-800 text-slate-400 py-2 font-bold text-xs uppercase tracking-widest mt-2 hover:bg-slate-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
