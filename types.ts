
export interface Sentence {
  id: string;
  original: string;
  translated: string;
  isModified: boolean;
  isProcessing: boolean;
}

export interface DocumentSegment {
  id: string;
  sentences: Sentence[];
  isInitialLoading: boolean;
}

export interface TranslationStyle {
  id: string;
  name: string;
  prompt: string;
}

export interface HistoryState {
  segments: DocumentSegment[];
}

export interface ApiSettings {
  baseUrl?: string;
  model: string;
  apiKey?: string;
}

export interface OriginalFileInfo {
  name: string;
  type: string;
  lastModified: number;
  data?: string; 
}

export interface ProjectData {
  version: string;
  timestamp: number;
  segments: DocumentSegment[];
  styles: TranslationStyle[];
  currentStyleId: string;
  history: HistoryState[];
  apiSettings?: ApiSettings;
  autoSync?: boolean;
  highlightEnabled?: boolean;
  originalFile?: OriginalFileInfo;
}
