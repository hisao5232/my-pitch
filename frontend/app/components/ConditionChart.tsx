import React, { useState } from 'react';
import { format } from 'date-fns';
import { Activity, Trash2, X } from 'lucide-react';
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
  onDeleteCondition: (date: string) => Promise<boolean>;
};

export default function ConditionChart({ conditions, selectedDay, onAddCondition, onDeleteCondition }: Props) {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  
  // 【削除機能】クリックされたデータを一時保存するステート
  const [targetEntry, setTargetEntry] = useState<ConditionEntry | null>(null);

  // 【登録機能】入力フォームの送信処理
  const handleSubmit = async () => {
    if (!weight || !bodyFat) return;
    const ok = await onAddCondition(parseFloat(weight), parseFloat(bodyFat), selectedDay);
    if (ok) {
      setWeight('');
      setBodyFat('');
    }
  };

  // 【削除機能】モーダルで「DELETE」を押した時の実行処理
  const handleDelete = async () => {
    if (!targetEntry) return;
    const ok = await onDeleteCondition(targetEntry.date);
    if (ok) setTargetEntry(null); // 成功したらモーダルを閉じる
  };

  return (
    <section className="space-y-6 relative">
      
      {/* --- 削除確認用オーバーレイモーダル --- */}
      {targetEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-700 p-6 max-w-sm w-full shadow-2xl rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-emerald-500 font-black uppercase tracking-tighter text-lg">Delete Record</h3>
              <button onClick={() => setTargetEntry(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              {format(new Date(targetEntry.date), 'yyyy/MM/dd')} の記録を削除してもよろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTargetEntry(null)}
                className="flex-1 py-2 text-sm font-bold border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 text-sm font-bold bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 size={16} /> DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ヘッダー部分 --- */}
      <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
        <Activity size={24} className="text-emerald-500" />
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Physical Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* --- 左側：データ入力フォーム --- */}
        <div className="md:col-span-1 bg-[#111827] p-6 border border-slate-800 rounded-sm shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Weight (kg)</label>
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
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Body Fat (%)</label>
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

        {/* --- 右側：グラフ表示エリア --- */}
        <div className="md:col-span-2 bg-[#111827] p-6 border border-slate-800 rounded-sm shadow-xl">
          <h3 className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest border-b border-dashed border-slate-700 pb-2">
            Growth Chart / Click dot to delete
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conditions} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#4b5563" 
                  tick={{ fontSize: 10 }} 
                  axisLine={false} 
                  // ここで「表示用」にフォーマットする
                  tickFormatter={(str) => {
                    try {
                      return format(new Date(str), 'MM/dd');
                    } catch {
                      return str;
                    }
                  }}
                />
                
                {/* 左右のY軸設定 */}
                <YAxis yAxisId="left" orientation="left" stroke="#10b981" tick={{ fontSize: 10 }} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} unit="kg" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 10 }} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} unit="%" />

                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #334155' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                
                /* --- 体重ライン --- */
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981', cursor: 'pointer' }}
                  // 第1引数はイベントオブジェクト、第2引数にRechartsのパケットが入る
                  activeDot={{ 
                    r: 6, 
                    onClick: (_e: any, props: any) => {
                      if (props?.payload) {
                        setTargetEntry(props.payload);
                      }
                    } 
                  }}
                />

                /* --- 体脂肪率ライン --- */
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="fat"
                  name="Body Fat"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#3b82f6', cursor: 'pointer' }}
                  activeDot={{ 
                    r: 6, 
                    onClick: (_e: any, props: any) => {
                      if (props?.payload) {
                        setTargetEntry(props.payload);
                      }
                    } 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </section>
  );
}
