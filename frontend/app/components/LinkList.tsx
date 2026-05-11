import React, { useState } from 'react';
import { LinkItem } from '../types';

type Props = {
  links: LinkItem[];
  onAddLink: (title: string, url: string) => Promise<boolean>;
  onDeleteLink: (id: number) => void;
};

export default function LinkList({ links, onAddLink, onDeleteLink }: Props) {
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddLink(newLinkTitle, newLinkUrl);
    if (ok) {
      setNewLinkTitle('');
      setNewLinkUrl('');
    }
  };

  return (
    <div className="bg-[#111827] p-6 border border-slate-800">
      <h2 className="text-[10px] font-black mb-4 uppercase tracking-[0.3em] text-emerald-500">
        Intelligence Source
      </h2>

      {/* 追加フォーム */}
      <div className="mb-6 p-3 bg-black/40 border border-slate-800 rounded-sm">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="SOURCE TITLE"
            value={newLinkTitle}
            onChange={e => setNewLinkTitle(e.target.value)}
            className="w-full bg-transparent border-b border-slate-700 text-[10px] font-bold text-white outline-none focus:border-emerald-500 placeholder:text-slate-800 transition-colors"
          />
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="HTTPS://..."
              value={newLinkUrl}
              onChange={e => setNewLinkUrl(e.target.value)}
              className="flex-1 bg-transparent border-b border-slate-700 text-[10px] text-slate-400 outline-none focus:border-emerald-500 placeholder:text-slate-800 transition-colors"
            />
            <button
              onClick={handleAdd}
              className="bg-emerald-950 text-emerald-500 border border-emerald-900 px-3 py-1 text-[10px] font-black hover:bg-emerald-500 hover:text-black transition-all"
            >
              PATCH
            </button>
          </div>
        </div>
      </div>

      {/* Link List */}
      <div className="space-y-1">
        {links.length > 0 ? (
          links.map(link => (
            <div
              key={link.id}
              className="flex items-center justify-between group border-b border-slate-800/50 py-2 hover:bg-slate-900/30 px-1 transition-colors"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors truncate italic"
              >
                {link.title}
              </a>
              <button
                onClick={() => onDeleteLink(link.id)}
                className="text-[9px] text-red-900 font-bold hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                [X]
              </button>
            </div>
          ))
        ) : (
          <div className="text-[9px] text-slate-800 font-bold tracking-widest text-center py-2 uppercase">
            No data link established
          </div>
        )}
      </div>
    </div>
  );
}
