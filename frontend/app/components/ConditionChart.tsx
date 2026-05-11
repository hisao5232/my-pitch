import React, { useState } from 'react';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ConditionEntry } from '../hooks/useConditions';

type Props = {
  conditions: ConditionEntry[];
  selectedDay: Date;
  onAddCondition: (weight: number, fat: number, date: Date) => Promise<boolean>;
};

export default function ConditionChart({ conditions, selectedDay, onAddCondition }: Props) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  const handleSubmit = async () => {
    if (!weight || !bodyFat) return;
    const ok = await onAddCondition(parseFloat(weight), parseFloat(bodyFat), selectedDay);
    if (ok) {
      setWeight('');
      setBodyFat('');
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
        <Activity size={24} className="text-emerald-500" />
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Physical Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="md:col-span-1 bg-[#111827] p-6 border border-slate-800 rounded-sm shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-full p-2 bg-black border border-slate-700 focus:border-emerald-500 outline-none text-white font-bold"
                placeholder="00.0"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">
                Body Fat (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={bodyFat}
                onChange={e => setBodyFat(e.target.value)}
                className="w-full p-2 bg-black border border-slate-700 focus:border-emerald-500 outline-none text-white font-bold"
                placeholder="00.0"
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-[#0a0f1e] py-3 font-black text-sm uppercase tracking-tighter transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]"
            >
              Log Status ({format(selectedDay, 'MM/dd')})
            </button>
          </div>
        </div>

        {/* Graph */}
        <div className="md:col-span-2 bg-[#111827] p-6 border border-slate-800 rounded-sm shadow-xl">
          <h3 className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest border-b border-dashed border-slate-700 pb-2">
            Growth Chart / Performance Curve
          </h3>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conditions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10 }} axisLine={false} />
                <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #334155' }}
                />
                <Line
                  yAxisId="left"
                  type="stepAfter"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="fat"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
