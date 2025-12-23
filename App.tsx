
import React, { useState, useEffect, useRef } from 'react';
import { DocumentSegment, TranslationStyle, HistoryState, ProjectData, ApiSettings, Sentence, OriginalFileInfo } from './types';
import SegmentRow from './components/SegmentRow';
import { translateParagraph, translateText, reverseTranslateSentence, testApiConnection } from './services/geminiService';

declare var mammoth: any;
declare var JSZip: any;
declare var window: any;

const INITIAL_STYLES: TranslationStyle[] = [
  { id: 'general', name: '通用风格', prompt: '中立、专业、准确，确保符合中文语境。' },
  { id: 'academic', name: '学术风格', prompt: '使用正式学术术语，语调严谨客观。' },
  { id: 'creative', name: '文学风格', prompt: '优美、自然、富有文采，注重意境。' }
];

const App: React.FC = () => {
  const [segments, setSegments] = useState<DocumentSegment[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [styles, setStyles] = useState<TranslationStyle[]>(INITIAL_STYLES);
  const [apiSettings, setApiSettings] = useState<ApiSettings>({ model: 'gemini-3-flash-preview', baseUrl: '', apiKey: '' });
  const [currentStyleId, setCurrentStyleId] = useState('general');
  const [autoSync, setAutoSync] = useState(true);
  const [highlightEnabled, setHighlightEnabled] = useState(false);
  const [isBulkTranslating, setIsBulkTranslating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isStyleEditing, setIsStyleEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hoveredSentenceId, setHoveredSentenceId] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<OriginalFileInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  const activeStyle = styles.find(s => s.id === currentStyleId) || styles[0];
  const projectInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);
  
  // 用于编辑防抖保存历史
  const editHistoryLock = useRef<boolean>(false);
  const editTimer = useRef<any>(null);

  useEffect(() => {
    const savedApi = localStorage.getItem("bilingual_sync_api_settings_v4");
    if (savedApi) try { setApiSettings(JSON.parse(savedApi)); } catch(e){}
    const savedStyles = localStorage.getItem("bilingual_sync_styles");
    if (savedStyles) try { setStyles(JSON.parse(savedStyles)); } catch(e){}

    // 快捷键监听
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (!showSettings && !isStyleEditing) {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [segments, history]); // 依赖项包含 history 以确保在快捷键中能获取最新栈

  const saveToHistory = () => {
    // 保存当前状态的快照，最大保留 50 步
    const snapshot = JSON.parse(JSON.stringify(segments));
    setHistory(prev => [{ segments: snapshot }, ...prev.slice(0, 49)]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const [lastState, ...remainingHistory] = history;
    // 恢复状态
    setSegments(lastState.segments);
    setHistory(remainingHistory);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const translateFullDocument = async () => {
    if (isBulkTranslating) return;
    saveToHistory(); // 翻译前保存
    setIsBulkTranslating(true);
    abortRef.current = false;
    
    const CONCURRENCY = 3;
    const taskQueue = [...segments];
    
    const worker = async () => {
      while (taskQueue.length > 0) {
        if (abortRef.current) break;
        const seg = taskQueue.shift();
        if (!seg) break;
        
        setSegments(prev => prev.map(p => p.id === seg.id ? { ...p, isInitialLoading: true } : p));
        try {
          const texts = seg.sentences.map(s => s.original || " "); 
          const trans = await translateParagraph(texts, activeStyle.prompt, apiSettings);
          if (abortRef.current) throw new Error("Abort");

          setSegments(prev => prev.map(p => p.id === seg.id ? { 
            ...p, isInitialLoading: false,
            sentences: p.sentences.map((s, idx) => ({ 
              ...s, 
              translated: trans[idx] && trans[idx] !== " " ? trans[idx] : s.translated 
            }))
          } : p));
        } catch (e) {
          setSegments(prev => prev.map(p => p.id === seg.id ? { ...p, isInitialLoading: false } : p));
        }
      }
    };
    await Promise.all(Array(Math.min(CONCURRENCY, segments.length)).fill(null).map(worker));
    setIsBulkTranslating(false);
  };

  const handleIndividualTranslate = async (segmentId: string, sentenceId: string) => {
    saveToHistory(); // 翻译单句前保存
    setSegments(prev => prev.map(seg => seg.id === segmentId ? {
      ...seg, sentences: seg.sentences.map(s => s.id === sentenceId ? { ...s, isProcessing: true } : s)
    } : seg));
    try {
      const seg = segments.find(s => s.id === segmentId);
      const sent = seg?.sentences.find(s => s.id === sentenceId);
      if (sent) {
        const res = await translateText(sent.original, activeStyle.prompt, apiSettings);
        setSegments(prev => prev.map(p => p.id === segmentId ? {
          ...p, sentences: p.sentences.map(s => s.id === sentenceId ? { ...s, translated: res, isProcessing: false, isModified: true } : s)
        } : p));
      }
    } catch (e) {
      setSegments(prev => prev.map(p => ({ ...p, sentences: p.sentences.map(s => s.id === sentenceId ? { ...s, isProcessing: false } : s) })));
    }
  };

  const handleUpdateSentence = async (segmentId: string, sentenceId: string, newValue: string, side: 'en' | 'cn') => {
    // 智能历史记录逻辑：仅在开始输入时保存一次快照
    if (!editHistoryLock.current) {
      saveToHistory();
      editHistoryLock.current = true;
    }
    // 2秒内没有新输入则解除锁定，下次输入将再次保存快照
    if (editTimer.current) clearTimeout(editTimer.current);
    editTimer.current = setTimeout(() => { editHistoryLock.current = false; }, 2000);

    setSegments(prev => prev.map(seg => seg.id === segmentId ? {
      ...seg, sentences: seg.sentences.map(s => s.id === sentenceId ? { ...s, [side === 'en' ? 'original' : 'translated']: newValue, isModified: true, isProcessing: autoSync } : s)
    } : seg));

    if (autoSync) {
      try {
        const seg = segments.find(s => s.id === segmentId);
        const sent = seg?.sentences.find(s => s.id === sentenceId);
        if (seg && sent) {
          if (side === 'cn') {
            // 用户修改中文，自动同步英文（反向翻译）
            const ctx = seg.sentences.map(s => s.original).join(' ');
            const res = await reverseTranslateSentence(sent.original, newValue, ctx, apiSettings);
            setSegments(prev => prev.map(p => p.id === segmentId ? { ...p, sentences: p.sentences.map(s => s.id === sentenceId ? { ...s, original: res, isProcessing: false } : s) } : p));
          } else {
            // 修改英文，同步中文
            const res = await translateText(newValue, activeStyle.prompt, apiSettings);
            setSegments(prev => prev.map(p => p.id === segmentId ? { ...p, sentences: p.sentences.map(s => s.id === sentenceId ? { ...s, translated: res, isProcessing: false } : s) } : p));
          }
        }
      } catch (e) {
        setSegments(prev => prev.map(p => ({ ...p, sentences: p.sentences.map(s => s.id === sentenceId ? { ...s, isProcessing: false } : s) })));
      }
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      let text = '';
      if (file.name.endsWith('.docx')) {
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = result.value;
      } else {
        text = new TextDecoder().decode(buffer);
      }
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(file);
      });
      setOriginalFile({ name: file.name, type: file.type, lastModified: file.lastModified, data: base64 });
      const newSegs = text.split(/\n\n+/).filter(b=>b.trim()).map((p, i) => ({
        id: `p-${i}`, isInitialLoading: false,
        sentences: p.split(/(?<=[.?!])\s+/).filter(s=>s.trim()).map((s, j)=>({ id: `s-${i}-${j}`, original: s, translated: '', isModified: false, isProcessing: false }))
      }));
      setSegments(newSegs);
      setHistory([]); // 新文件加载清空历史
      e.target.value = '';
    } catch (err) { alert("读取失败"); }
  };

  const exportProject = async () => {
    if (segments.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const projectData: ProjectData = { version: "3.9", timestamp: Date.now(), segments, styles, currentStyleId, history: history.slice(0, 5), apiSettings, autoSync, highlightEnabled, originalFile: originalFile || undefined };
      zip.file("project.json", JSON.stringify(projectData, null, 2));
      if (originalFile?.data) zip.file(`source/${originalFile.name}`, originalFile.data.split(',')[1], { base64: true });
      zip.file("translation/translated.md", segments.map(seg => seg.sentences.map(s => s.translated).join(' ')).join('\n\n'));
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url; a.download = `SyncProject_${new Date().toISOString().slice(0,10)}.zip`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { alert("导出失败"); }
    finally { setIsExporting(false); }
  };

  const handleProjectImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const zip = await JSZip.loadAsync(file);
      const projectFile = zip.file("project.json");
      if (!projectFile) throw new Error("无效工程包");
      const data = JSON.parse(await projectFile.async("string")) as ProjectData;
      setSegments(data.segments || []);
      setApiSettings(data.apiSettings || { model: 'gemini-3-flash-preview', baseUrl: '', apiKey: '' });
      setStyles(data.styles || INITIAL_STYLES);
      setCurrentStyleId(data.currentStyleId || 'general');
      setOriginalFile(data.originalFile);
      setHistory([]); // 导入后初始化历史
      alert("✅ 导入成功");
    } catch (e) { alert("❌ 导入失败"); }
    finally { e.target.value = ''; }
  };

  const handleStructureChange = (segmentId: string, type: string, sId?: string) => {
    saveToHistory(); // 结构变化（增删合并）前保存
    setSegments(prev => {
      const newSegments = [...prev];
      const segIdx = newSegments.findIndex(s => s.id === segmentId);
      if (segIdx === -1) return prev;
      const seg = { ...newSegments[segIdx], sentences: [...newSegments[segIdx].sentences] };
      if (type === 'add' && sId) {
        const idx = seg.sentences.findIndex(s => s.id === sId);
        seg.sentences.splice(idx + 1, 0, { id: `s-${Date.now()}`, original: '', translated: '', isModified: false, isProcessing: false });
      } else if (type === 'delete' && sId) {
        seg.sentences = seg.sentences.filter(s => s.id !== sId);
        if (seg.sentences.length === 0) { newSegments.splice(segIdx, 1); return newSegments; }
      } else if (type === 'merge' && sId) {
        const idx = seg.sentences.findIndex(s => s.id === sId);
        if (idx < seg.sentences.length - 1) {
          const cur = seg.sentences[idx]; const nxt = seg.sentences[idx+1];
          cur.original = (cur.original + ' ' + nxt.original).trim();
          cur.translated = (cur.translated + ' ' + nxt.translated).trim();
          seg.sentences.splice(idx + 1, 1);
        }
      } else if (type === 'add-segment') {
        newSegments.splice(segIdx + 1, 0, { id: `seg-${Date.now()}`, sentences: [{ id: `s-${Date.now()}`, original: '', translated: '', isModified: false, isProcessing: false }], isInitialLoading: false });
        return newSegments;
      } else if (type === 'delete-segment') {
        if (confirm("确定删除段落？")) { newSegments.splice(segIdx, 1); return newSegments; }
        return prev;
      }
      newSegments[segIdx] = seg;
      return newSegments;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <header className="h-20 bg-white/95 dark:bg-slate-900/95 border-b dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-50 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">文</div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-black leading-tight">Sync Editor Pro</h1>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">v3.9 Full Undo System</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {segments.length > 0 && (
            <>
              {/* 撤销按钮 UI */}
              <button 
                onClick={handleUndo} 
                disabled={history.length === 0}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${history.length > 0 ? 'bg-white dark:bg-slate-800 text-indigo-600 border-indigo-100 dark:border-indigo-900/50 hover:shadow-md' : 'text-slate-300 border-transparent cursor-not-allowed'}`}
                title="撤销 (Ctrl+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                {history.length > 0 && <span className="text-xs font-black">{history.length}</span>}
              </button>

              <button onClick={isBulkTranslating ? () => { abortRef.current = true; setIsBulkTranslating(false); } : translateFullDocument} className={`${isBulkTranslating ? 'bg-red-500' : 'bg-indigo-600'} text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2`}>
                {isBulkTranslating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                <span className="text-sm">{isBulkTranslating ? "中止" : "全篇翻译"}</span>
              </button>
              
              <button onClick={exportProject} disabled={isExporting} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" strokeWidth="2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 <span className="text-sm">导出工程</span>
              </button>
            </>
          )}

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border dark:border-slate-700">
            <select value={currentStyleId} onChange={e => setCurrentStyleId(e.target.value)} className="bg-transparent px-2 py-1 text-xs font-bold outline-none cursor-pointer dark:text-slate-200">
              {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={() => setIsStyleEditing(!isStyleEditing)} title="编辑风格 Prompt" className={`p-1.5 rounded-lg ${isStyleEditing ? 'bg-indigo-600 text-white' : 'hover:bg-white dark:hover:bg-slate-700 text-slate-400'}`}>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
          
          <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
          
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-indigo-600 shadow-sm transition-all">
             {isDarkMode ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L5.121 5.121" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </button>
          
          <input type="file" ref={projectInputRef} className="hidden" accept=".zip" onChange={handleProjectImport} />
        </div>
      </header>

      {isStyleEditing && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 px-12 border-b dark:border-indigo-900/30 sticky top-20 z-40 backdrop-blur-md">
           <label className="text-[10px] font-black uppercase text-indigo-500 mb-1 block">编辑 Prompt：{activeStyle.name}</label>
           <textarea value={activeStyle.prompt} onChange={e => {
             const next = styles.map(s => s.id === currentStyleId ? { ...s, prompt: e.target.value } : s);
             setStyles(next); localStorage.setItem("bilingual_sync_styles", JSON.stringify(next));
           }} className="w-full bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-3 text-sm h-16 outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner dark:text-slate-200" />
           <div className="mt-1 text-right"><button onClick={() => setIsStyleEditing(false)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400">关闭</button></div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-8 py-6">
        {segments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h2 className="text-3xl font-black mb-10 dark:text-slate-100">Ready to Sync?</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                 上传 Word/Markdown
                 <input type="file" className="hidden" onChange={handleFileUpload} accept=".docx,.md,.txt" />
              </label>
              <button onClick={() => projectInputRef.current?.click()} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-12 py-5 rounded-2xl font-black hover:bg-slate-50 transition-all dark:text-slate-200 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                导入 ZIP 工程
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
             <div className="bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-2xl overflow-hidden mb-20 animate-in">
                <div className="grid grid-cols-2 bg-slate-100/50 dark:bg-slate-800/50 border-b dark:border-slate-700 sticky top-0 z-30 backdrop-blur-md">
                  <div className="px-10 py-3 text-[10px] font-black uppercase text-slate-500 border-r dark:border-slate-700">English Original</div>
                  <div className="px-10 py-3 text-[10px] font-black uppercase text-slate-500">Chinese Translation</div>
                </div>
                <div className="divide-y dark:divide-slate-800">
                  {segments.map(seg => (
                    <SegmentRow 
                      key={seg.id} 
                      segment={seg} 
                      autoSync={autoSync} 
                      highlightEnabled={highlightEnabled} 
                      onUpdateSentence={handleUpdateSentence} 
                      onIndividualTranslate={handleIndividualTranslate}
                      hoveredSentenceId={hoveredSentenceId} 
                      setHoveredSentenceId={setHoveredSentenceId} 
                      onStructureChange={(type, sId) => handleStructureChange(seg.id, type, sId)} 
                    />
                  ))}
                </div>
             </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-black mb-6 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              API 与 模型配置
            </h2>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">接口地址 (Base URL)</label>
                <input 
                  type="text" 
                  value={apiSettings.baseUrl} 
                  onChange={e => setApiSettings({...apiSettings, baseUrl: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="https://api.juheai.top/v1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">模型名称 (Model)</label>
                <input 
                  type="text" 
                  value={apiSettings.model} 
                  onChange={e => setApiSettings({...apiSettings, model: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="google/gemini-2.5-pro-preview-06-05"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">自定义 API KEY</label>
                <input 
                  type="password" 
                  value={apiSettings.apiKey} 
                  onChange={e => setApiSettings({...apiSettings, apiKey: e.target.value})} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="sk-..."
                />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button onClick={async () => {
                  setIsTesting(true); 
                  try { 
                    const ok = await testApiConnection(apiSettings); 
                    alert(ok ? "✅ 连接成功！接口响应正常。" : "❌ 连接失败，请检查配置。"); 
                  } catch(e:any){alert(e.message)} finally {setIsTesting(false)}
                }} disabled={isTesting} className="w-full py-2.5 text-xs font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
                  {isTesting ? "测试中..." : "测试连接连通性"}
                </button>
                <button onClick={() => { localStorage.setItem("bilingual_sync_api_settings_v4", JSON.stringify(apiSettings)); setShowSettings(false); }} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl font-black shadow-lg">保存配置并关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
