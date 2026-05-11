import React, { useState } from 'react';
import { VideoItem } from '../types';

type Props = {
  videos: VideoItem[];
  onAddVideo: (title: string, url: string) => Promise<boolean>;
  getEmbedUrl: (url: string) => string;
};

export default function VideoList({ videos, onAddVideo, getEmbedUrl }: Props) {
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await onAddVideo(newVideoTitle, newVideoUrl);
    if (ok) {
      setNewVideoTitle('');
      setNewVideoUrl('');
    }
  };

  return (
    <div className="bg-black/50 p-4 border-2 border-dashed border-slate-800">
      <h2 className="text-sm font-black mb-4 uppercase text-orange-500">Training Film</h2>

      {/* 追加フォーム */}
      <form onSubmit={handleAdd} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="FILM TITLE"
          value={newVideoTitle}
          onChange={e => setNewVideoTitle(e.target.value)}
          className="w-full bg-transparent border-b border-slate-700 text-[10px] font-bold text-white outline-none focus:border-orange-500 placeholder:text-slate-800 transition-colors"
        />
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="YOUTUBE URL"
            value={newVideoUrl}
            onChange={e => setNewVideoUrl(e.target.value)}
            className="flex-1 bg-transparent border-b border-slate-700 text-[10px] text-slate-400 outline-none focus:border-orange-500 placeholder:text-slate-800 transition-colors"
          />
          <button
            type="submit"
            className="bg-orange-950 text-orange-500 border border-orange-900 px-3 py-1 text-[10px] font-black hover:bg-orange-500 hover:text-black transition-all"
          >
            ADD
          </button>
        </div>
      </form>

      {/* Video List */}
      <div className="grid grid-cols-1 gap-4">
        {videos.map(video => (
          <div key={video.id} className="bg-[#0a0f1e] p-2 border border-slate-800">
            <div className="text-[9px] font-bold text-slate-500 mb-1 truncate">
              FILE: {video.title}
            </div>
            <div className="relative aspect-video grayscale hover:grayscale-0 transition-all duration-500">
              <iframe
                src={getEmbedUrl(video.url)}
                title={video.title}
                className="absolute w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
