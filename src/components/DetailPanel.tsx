import { ImageItem } from '../data/images';

interface DetailPanelProps {
  image: ImageItem;
  onClose: () => void;
}

export default function DetailPanel({ image, onClose }: DetailPanelProps) {
  return (
    <aside className="w-72 bg-[#181825] border-l border-[#313244] flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#313244]">
        <h3 className="text-sm font-semibold text-white">Details</h3>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#6c7086] hover:text-white hover:bg-[#313244] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="p-4">
        <div className={`h-40 rounded-xl bg-gradient-to-br ${image.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title & Info */}
      <div className="px-4 pb-4">
        <h4 className="text-base font-semibold text-white mb-1">{image.title}</h4>
        <p className="text-xs text-[#6c7086] capitalize">{image.category}</p>
      </div>

      {/* Metadata */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Camera Settings</p>
        <div className="space-y-2.5">
          <MetaRow icon="camera" label="Camera" value={image.camera} />
          <MetaRow icon="lens" label="Lens" value={image.lens} />
          <MetaRow icon="aperture" label="Aperture" value={image.aperture} />
          <MetaRow icon="shutter" label="Shutter" value={image.shutterSpeed} />
          <MetaRow icon="iso" label="ISO" value={image.iso} />
          <MetaRow icon="focal" label="Focal Length" value={image.focalLength} />
        </div>
      </div>

      {/* File Info */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">File Info</p>
        <div className="space-y-2.5">
          <MetaRow icon="dimensions" label="Dimensions" value={`${image.width} × ${image.height}`} />
          <MetaRow icon="date" label="Date" value={formatDate(image.date)} />
          <MetaRow icon="size" label="File Size" value={`${(Math.random() * 20 + 5).toFixed(1)} MB`} />
        </div>
      </div>

      {/* Tags */}
      <div className="px-4 pb-4">
        <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {image.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-md bg-[#313244] text-[#a6adc8] hover:bg-[#45475a] hover:text-white transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-violet-500 hover:bg-violet-600 text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#313244] hover:bg-[#45475a] text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </aside>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-md bg-[#313244] flex items-center justify-center shrink-0">
        <MetaIcon type={icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#6c7086]">{label}</p>
        <p className="text-xs text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function MetaIcon({ type }: { type: string }) {
  const className = "w-3.5 h-3.5 text-[#6c7086]";
  
  switch (type) {
    case 'camera':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'lens':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case 'aperture':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6-6l6 6 6-6M6 9l6-6 6 6" />
        </svg>
      );
    case 'shutter':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'iso':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      );
    case 'focal':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      );
    case 'dimensions':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      );
    case 'date':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'size':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return null;
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
