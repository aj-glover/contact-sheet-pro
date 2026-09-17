interface ToolbarProps {
  gridSize: 'small' | 'medium' | 'large';
  setGridSize: (size: 'small' | 'medium' | 'large') => void;
  selectedCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  totalCount: number;
  onOpenShooting: () => void;
  hasCamera: boolean;
}

export default function Toolbar({ gridSize, setGridSize, selectedCount, onSelectAll, onClearSelection, totalCount, onOpenShooting, hasCamera }: ToolbarProps) {
  return (
    <div className="h-12 flex items-center justify-between px-5 bg-[#1e1e2e] border-b border-[#313244] shrink-0">
      {/* Left side - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSelectAll}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-white transition-colors"
        >
          {selectedCount === totalCount && totalCount > 0 ? 'Deselect All' : 'Select All'}
        </button>
        
        {selectedCount > 0 && (
          <>
            <div className="w-px h-5 bg-[#313244] mx-1"></div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tag
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-white transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button
              onClick={onClearSelection}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-[#6c7086] hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </>
        )}
      </div>

      {/* Right side - Grid size controls & Shoot button */}
      <div className="flex items-center gap-3">
        {/* Quick Shoot button */}
        {hasCamera && (
          <button
            onClick={onOpenShooting}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500/15 to-rose-500/15 hover:from-red-500/25 hover:to-rose-500/25 border border-red-500/20 text-red-300 text-xs font-medium transition-all"
          >
            <div className="w-4 h-4 rounded-full border-2 border-red-400 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
            </div>
            Capture
          </button>
        )}

        <div className="w-px h-5 bg-[#313244]"></div>

        <div className="flex items-center gap-1 bg-[#181825] rounded-lg p-1 border border-[#313244]">
          <button
            onClick={() => setGridSize('small')}
            className={`p-1.5 rounded-md transition-colors ${
              gridSize === 'small' ? 'bg-[#313244] text-white' : 'text-[#6c7086] hover:text-white'
            }`}
            title="Small grid"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setGridSize('medium')}
            className={`p-1.5 rounded-md transition-colors ${
              gridSize === 'medium' ? 'bg-[#313244] text-white' : 'text-[#6c7086] hover:text-white'
            }`}
            title="Medium grid"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button
            onClick={() => setGridSize('large')}
            className={`p-1.5 rounded-md transition-colors ${
              gridSize === 'large' ? 'bg-[#313244] text-white' : 'text-[#6c7086] hover:text-white'
            }`}
            title="Large grid"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
