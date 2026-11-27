export type Clue = { id: string; title: string; text: string };

export type AreaInfo = { id: string; name: string };

export type CaseInfo = {
  id: string;
  title: string;
  briefing: string;
  maxAreas: number;
  totalClues: number;
  areas: AreaInfo[];
};

export type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
  caseInfo: CaseInfo;
  areasUsed: string[];
  clues: Record<string, Clue[]>;
};

export type VisitResponse = {
  type: 'visit';
  areaId: string;
  areasUsed: string[];
  clues: Clue[];
};