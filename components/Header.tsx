
import React from 'react';

interface HeaderProps {
  onHighlightToggle: (val: boolean) => void;
  highlightEnabled: boolean;
  isProcessing: boolean;
}

const Header: React.FC<HeaderProps> = ({ onHighlightToggle, highlightEnabled, isProcessing }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          文
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bilingual Sync Editor</h1>
          <p className="text-xs text-slate-500">Intelligent Word Document Localization</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer group">
          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
            Highlight Modified
          </span>
          <div 
            onClick={() => onHighlightToggle(!highlightEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${highlightEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highlightEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </div>
        </label>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-indigo-600 animate-pulse">
            <div className="w-2 h-2 bg-current rounded-full"></div>
            <span className="text-sm font-semibold uppercase tracking-wider">Syncing...</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
