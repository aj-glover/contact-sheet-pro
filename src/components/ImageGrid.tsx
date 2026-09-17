import { ImageItem } from '../data/images';

interface ImageGridProps {
  images: ImageItem[];
  gridSize: 'small' | 'medium' | 'large';
  selectedImages: string[];
  onImageClick: (image: ImageItem, multiSelect: boolean) => void;
}

export default function ImageGrid({ images, gridSize, selectedImages, onImageClick }: ImageGridProps) {
  const gridCols = {
    small: 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    medium: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    large: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const cardHeight = {
    small: 'h-32',
    medium: 'h-44',
    large: 'h-56',
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className={`grid ${gridCols[gridSize]} gap-3`}>
        {images.map((image) => {
          const isSelected = selectedImages.includes(image.id);
          return (
            <ImageCard
              key={image.id}
              image={image}
              height={cardHeight[gridSize]}
              isSelected={isSelected}
              onClick={(e) => onImageClick(image, e.ctrlKey || e.metaKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ImageCardProps {
  image: ImageItem;
  height: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

function ImageCard({ image, height, isSelected, onClick }: ImageCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#1e1e2e] scale-[0.98]' 
          : 'hover:ring-1 hover:ring-[#45475a] hover:scale-[1.02]'
      }`}
    >
      {/* Image placeholder with gradient */}
      <div className={`${height} bg-gradient-to-br ${image.gradient} relative`}>
        {/* Decorative elements to simulate photo content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full relative overflow-hidden">
            {/* Simulated landscape/photo elements */}
            <PhotoPattern category={image.category} />
          </div>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"></div>
      </div>

      {/* Selection indicator */}
      <div className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
        isSelected 
          ? 'bg-violet-500 border-violet-500' 
          : 'border-white/50 bg-black/20 opacity-0 group-hover:opacity-100'
      }`}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <p className="text-xs font-medium text-white truncate">{image.title}</p>
        <p className="text-[10px] text-white/70">{image.camera}</p>
      </div>

      {/* Category badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/40 text-white/80 backdrop-blur-sm capitalize">
          {image.category}
        </span>
      </div>
    </div>
  );
}

function PhotoPattern({ category }: { category: string }) {
  switch (category) {
    case 'landscape':
      return (
        <svg className="w-full h-full opacity-30" viewBox="0 0 200 120" fill="none">
          <path d="M0 80 L40 50 L80 70 L120 30 L160 60 L200 40 L200 120 L0 120Z" fill="rgba(255,255,255,0.3)" />
          <path d="M0 100 L60 70 L100 85 L150 55 L200 75 L200 120 L0 120Z" fill="rgba(255,255,255,0.2)" />
          <circle cx="160" cy="25" r="12" fill="rgba(255,255,255,0.4)" />
        </svg>
      );
    case 'portrait':
      return (
        <svg className="w-full h-full opacity-30" viewBox="0 0 200 120" fill="none">
          <circle cx="100" cy="45" r="20" fill="rgba(255,255,255,0.3)" />
          <path d="M70 120 Q70 75 100 75 Q130 75 130 120" fill="rgba(255,255,255,0.2)" />
        </svg>
      );
    case 'street':
      return (
        <svg className="w-full h-full opacity-30" viewBox="0 0 200 120" fill="none">
          <rect x="20" y="30" width="30" height="90" fill="rgba(255,255,255,0.2)" />
          <rect x="60" y="15" width="25" height="105" fill="rgba(255,255,255,0.25)" />
          <rect x="95" y="40" width="35" height="80" fill="rgba(255,255,255,0.2)" />
          <rect x="140" y="20" width="28" height="100" fill="rgba(255,255,255,0.22)" />
          <rect x="175" y="50" width="20" height="70" fill="rgba(255,255,255,0.18)" />
        </svg>
      );
    case 'nature':
      return (
        <svg className="w-full h-full opacity-30" viewBox="0 0 200 120" fill="none">
          <path d="M100 100 L100 60" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
          <circle cx="100" cy="45" r="25" fill="rgba(255,255,255,0.2)" />
          <path d="M50 100 L50 70" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="50" cy="58" r="16" fill="rgba(255,255,255,0.15)" />
          <path d="M150 100 L150 65" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
          <circle cx="150" cy="52" r="18" fill="rgba(255,255,255,0.15)" />
        </svg>
      );
    default:
      return (
        <svg className="w-full h-full opacity-20" viewBox="0 0 200 120" fill="none">
          <rect x="30" y="20" width="140" height="80" rx="8" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" />
          <circle cx="70" cy="50" r="15" fill="rgba(255,255,255,0.2)" />
          <path d="M30 80 L80 55 L120 70 L170 40" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" />
        </svg>
      );
  }
}
