import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ImageGrid from './components/ImageGrid';
import DetailPanel from './components/DetailPanel';
import { images, ImageItem } from './data/images';

export default function App() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const filteredImages = images.filter((img) => {
    const matchesFilter = activeFilter === 'all' || img.category === activeFilter;
    const matchesSearch = searchQuery === '' || 
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleImageClick = (image: ImageItem, multiSelect: boolean) => {
    if (multiSelect) {
      setSelectedImages(prev => 
        prev.includes(image.id) 
          ? prev.filter(id => id !== image.id)
          : [...prev, image.id]
      );
    } else {
      setSelectedImages([image.id]);
    }
    setActiveImage(image);
    setShowDetailPanel(true);
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.id));
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1e1e2e] text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-5 bg-[#181825] border-b border-[#313244] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Contact Sheet Pro</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#a6adc8]">
            {selectedImages.length > 0 ? `${selectedImages.length} selected` : `${filteredImages.length} images`}
          </span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Center Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <Toolbar 
            gridSize={gridSize}
            setGridSize={setGridSize}
            selectedCount={selectedImages.length}
            onSelectAll={handleSelectAll}
            onClearSelection={() => { setSelectedImages([]); setShowDetailPanel(false); }}
            totalCount={filteredImages.length}
          />

          {/* Image Grid */}
          <ImageGrid 
            images={filteredImages}
            gridSize={gridSize}
            selectedImages={selectedImages}
            onImageClick={handleImageClick}
          />
        </div>

        {/* Detail Panel */}
        {showDetailPanel && activeImage && (
          <DetailPanel 
            image={activeImage}
            onClose={() => setShowDetailPanel(false)}
          />
        )}
      </div>
    </div>
  );
}
