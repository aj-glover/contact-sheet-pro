import { categories } from '../data/images';
import { CameraDevice } from '../data/cameras';

interface SidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  connectedCameras?: CameraDevice[];
  onOpenShooting?: () => void;
}

export default function Sidebar({ activeFilter, setActiveFilter, searchQuery, setSearchQuery, connectedCameras = [], onOpenShooting }: SidebarProps) {
  return (
    <aside className="w-60 bg-[#181825] border-r border-[#313244] flex flex-col shrink-0">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6c7086]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-white placeholder-[#6c7086] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Connected Cameras */}
      {connectedCameras.length > 0 && (
        <div className="px-3 pb-3">
          <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider px-2 mb-2">Connected</p>
          <div className="space-y-1">
            {connectedCameras.map((camera) => (
              <button
                key={camera.id}
                onClick={onOpenShooting}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 hover:bg-emerald-500/10 transition-colors group"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/15 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#181825]"></span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-emerald-300 truncate">{camera.name}</p>
                  <p className="text-[10px] text-[#6c7086] capitalize flex items-center gap-1">
                    {camera.connectionType === 'tethered' ? (
                      <>
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        USB
                      </>
                    ) : (
                      <>
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01" />
                        </svg>
                        WiFi
                      </>
                    )}
                  </p>
                </div>
                <svg className="w-3.5 h-3.5 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="px-3 pb-2">
        <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider px-2 mb-2">Categories</p>
        <nav className="space-y-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeFilter === cat.id
                  ? 'bg-violet-500/15 text-violet-300 font-medium'
                  : 'text-[#a6adc8] hover:bg-[#1e1e2e] hover:text-white'
              }`}
            >
              <CategoryIcon type={cat.icon} active={activeFilter === cat.id} />
              <span className="flex-1 text-left">{cat.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                activeFilter === cat.id ? 'bg-violet-500/20 text-violet-300' : 'bg-[#313244] text-[#6c7086]'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="mt-auto p-4 border-t border-[#313244]">
        <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Storage</p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#a6adc8]">Used</span>
            <span className="text-white font-medium">12.4 GB</span>
          </div>
          <div className="h-1.5 bg-[#313244] rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#a6adc8]">Available</span>
            <span className="text-[#a6adc8]">7.6 GB free</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function CategoryIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'text-violet-400' : 'text-[#6c7086]';
  
  switch (type) {
    case 'grid':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case 'mountain':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'user':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'building':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'leaf':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
    default:
      return null;
  }
}
