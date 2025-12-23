
import React, { useState, useEffect, useRef } from 'react';
import { DocumentSegment } from '../types';

interface SegmentRowProps {
  segment: DocumentSegment;
  autoSync: boolean;
  highlightEnabled: boolean;
  onUpdateSentence: (segmentId: string, sentenceId: string, newValue: string, sourceSide: 'en' | 'cn', forceSync?: boolean) => void;
  onIndividualTranslate: (segmentId: string, sentenceId: string) => void;
  hoveredSentenceId: string | null;
  setHoveredSentenceId: (id: string | null) => void;
  onStructureChange: (type: 'add' | 'delete' | 'merge' | 'add-segment' | 'delete-segment', sId?: string) => void;
}

const SegmentRow: React.FC<SegmentRowProps> = ({ 
  segment, autoSync, highlightEnabled, onUpdateSentence, onIndividualTranslate,
  hoveredSentenceId, setHoveredSentenceId, onStructureChange 
}) => {
  const [localEN, setLocalEN] = useState<Record<string, string>>({});
  const [localCN, setLocalCN] = useState<Record<string, string>>({});
  const timeoutRefs = useRef<Record<string, any>>({});
  const textareaRefs = useRef<Record<string, Record<string, HTMLTextAreaElement | null>>>({});

  // 初始化本地缓存
  useEffect(() => {
    const en: Record<string, string> = {};
    const cn: Record<string, string> = {};
    segment.sentences.forEach(s => { en[s.id] = s.original; cn[s.id] = s.translated; });
    setLocalEN(en); setLocalCN(cn);
  }, [segment.sentences]);

  const handleEdit = (sId: string, val: string, side: 'en' | 'cn') => {
    if (side === 'en') setLocalEN(p => ({ ...p, [sId]: val }));
    else setLocalCN(p => ({ ...p, [sId]: val }));
    
    // 动态调高
    const el = textareaRefs.current[sId]?.[side];
    if (el) adjustHeight(el);

    const key = `${side}-${sId}`;
    if (timeoutRefs.current[key]) clearTimeout(timeoutRefs.current[key]);
    timeoutRefs.current[key] = setTimeout(() => onUpdateSentence(segment.id, sId, val, side), 1200);
  };

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="relative group/segment border-b dark:border-slate-800 last:border-0">
      {/* 段落级加载状态 */}
      {segment.isInitialLoading && (
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] z-40 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 句子行循环 - 物理绑定每一对中英文 */}
      <div className="flex flex-col">
        {segment.sentences.map((s) => {
          const isHovered = hoveredSentenceId === s.id;
          const isModified = s.isModified && highlightEnabled;
          const isProcessing = s.isProcessing;

          return (
            <div 
              key={s.id}
              onMouseEnter={() => setHoveredSentenceId(s.id)}
              onMouseLeave={() => setHoveredSentenceId(null)}
              className={`grid grid-cols-2 relative transition-all duration-200 ${isHovered ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
            >
              {/* 英文句子容器 */}
              <div className={`p-4 md:p-6 border-r dark:border-slate-800 relative ${isModified ? 'bg-yellow-50/20 dark:bg-yellow-900/10' : ''}`}>
                <textarea
                  ref={el => {
                    if (!textareaRefs.current[s.id]) textareaRefs.current[s.id] = {};
                    textareaRefs.current[s.id]['en'] = el;
                    adjustHeight(el);
                  }}
                  value={localEN[s.id] || ''}
                  onChange={e => handleEdit(s.id, e.target.value, 'en')}
                  className="w-full bg-transparent resize-none focus:outline-none leading-relaxed block overflow-hidden dark:text-slate-200 font-medium"
                  placeholder="EN source..."
                  rows={1}
                />
              </div>

              {/* 中文句子容器 */}
              <div className={`p-4 md:p-6 relative ${isModified ? 'bg-yellow-50/20 dark:bg-yellow-900/10' : ''}`}>
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                <textarea
                  ref={el => {
                    if (!textareaRefs.current[s.id]) textareaRefs.current[s.id] = {};
                    textareaRefs.current[s.id]['cn'] = el;
                    adjustHeight(el);
                  }}
                  value={localCN[s.id] || ''}
                  onChange={e => handleEdit(s.id, e.target.value, 'cn')}
                  className="w-full bg-transparent resize-none focus:outline-none leading-relaxed block overflow-hidden dark:text-slate-200 font-medium"
                  placeholder="等待翻译..."
                  rows={1}
                />

                {/* 悬浮操作菜单 - 基于句子行定位 */}
                {isHovered && !isProcessing && (
                  <div className="absolute right-2 top-2 flex flex-col gap-1 z-30 scale-75 origin-top-right">
                    <button onClick={() => onIndividualTranslate(segment.id, s.id)} className="p-2 bg-indigo-600 text-white rounded-lg shadow-xl hover:scale-110 transition-transform"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
                    <button onClick={() => onStructureChange('add', s.id)} className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg shadow-md border dark:border-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg></button>
                    <button onClick={() => onStructureChange('merge', s.id)} className="p-2 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg shadow-md border dark:border-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 13l-7 7-7-7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                    <button onClick={() => onStructureChange('delete', s.id)} className="p-2 bg-white dark:bg-slate-700 text-red-500 rounded-lg shadow-md border dark:border-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 段落级插入按钮 */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover/segment:opacity-100 transition-opacity">
        <button onClick={() => onStructureChange('add-segment')} className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg> 插入新段落
        </button>
      </div>
      
      {/* 段落级删除按钮 */}
      <button onClick={() => onStructureChange('delete-segment')} className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/segment:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all hidden xl:block">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
};

export default SegmentRow;
