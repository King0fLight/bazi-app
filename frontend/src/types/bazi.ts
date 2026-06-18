export interface StemInfo {
  name: string;
  element: string;
  yinyang: string;
  shishen: string;
}

export interface BranchInfo {
  name: string;
  element: string;
  animal: string;
  canggan: StemInfo[];
}

export interface Pillar {
  name: string;
  stem: StemInfo;
  branch: BranchInfo;
  nayin: string;
  changsheng: string;
}

export interface DayunItem {
  stem: string;
  branch: string;
  element: string;
  start_age: number;
  start_year: number;
  nayin: string;
}

export interface ShenshaItem {
  name: string;
  type: string;
  pillar: string;
}

export interface WuxingCount {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}

export interface DizhiRelation {
  type: string;
  branches: string[];
  detail: string;
}

export interface TianganRelation {
  type: string;
  stems: string[];
  detail: string;
}

export interface BaziChart {
  solar_date: string;
  lunar_date: string;
  gender: string;
  year_pillar: Pillar;
  month_pillar: Pillar;
  day_pillar: Pillar;
  hour_pillar: Pillar;
  day_master: StemInfo;
  dayun: DayunItem[];
  dayun_start_age: number;
  wuxing: WuxingCount;
  shensha: ShenshaItem[];
  dizhi_relations: DizhiRelation[];
  tiangan_relations: TianganRelation[];
  kongwang: string[];
  shengxiao: string;
}

export interface BaziInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  gender: string;
  zi_mode: string;
}
