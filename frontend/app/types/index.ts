// 型定義 + garbageLabels を一元管理
export type Schedule = {
  id: number;
  title: string;
  description: string;
  date: string;
  category?: string;
};

export type LinkItem = {
  id: number;
  title: string;
  url: string;
};

export type VideoItem = {
  id: number;
  title: string;
  url: string;
  category: string;
};

export type GarbageType = 'NON_BURNABLE' | 'BATTERY' | 'BOTTLE' | 'PAPER';

export const garbageLabels: Record<GarbageType, string> = {
  NON_BURNABLE: 'NON-BURN',
  BATTERY: 'BATT',
  BOTTLE: 'BTLS/CANS',
  PAPER: 'PAPER/BOX',
};
