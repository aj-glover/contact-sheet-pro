import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ImageGrid from './components/ImageGrid';
import DetailPanel from './components/DetailPanel';
import CameraConnectModal from './components/CameraConnectModal';
import ShootingPanel from './components/ShootingPanel';
import { images, ImageItem } from './data/images';
import { availableCameras, CameraDevice, ConnectionType } from './data/cameras';

export default function App() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  // Camera/shooting state
  const [cameras, setCameras] = useState<CameraDevice[]>(availableCameras);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showShootingPanel, setShowShootingPanel] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);

  const connectedCameras = cameras.filter(c => c.status === 'connected');
  const activeCamera = cameras.find(c => c.id === activeCameraId) || null;

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

  const handleConnectCamera = useCallback((cameraId: string, type: ConnectionType) => {
    setCameras(prev => prev.map(c => 
      c.id === cameraId 
        ? { ...c, status: 'connected' as const, connectionType: type }
        : c
    ));
    setActiveCameraId(cameraId);
    setShowShootingPanel(true);
    setShowConnectModal(false);
  }, []);

  const handleDisconnectCamera = useCallback((cameraId: string) => {
    setCameras(prev => prev.map(c => 
      c.id === cameraId ? { ...c, status: 'disconnected' as const } : c
    ));
    if (activeCameraId === cameraId) {
      setActiveCameraId(null);
      setShowShootingPanel(false);
    }
  }, [activeCameraId]);

  const handleCapture = () => {
    // Simulate capture - in a real app this would trigger the camera
    console.log('Capture triggered');
  };

  const handleOpenShooting = () => {
    if (connectedCameras.length > 0) {
      setActiveCameraId(connectedCameras[0].id);
      setShowShootingPanel(true);
    } else {
      setShowConnectModal(true);
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
          
          {/* Connected cameras indicator */}
          {connectedCameras.length > 0 && (
            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-[#313244]">
              {connectedCameras.map(cam => (
                <button
                  key={cam.id}
                  onClick={handleOpenShooting}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                  title={`${cam.name} - ${cam.connectionType}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-300 font-medium">{cam.name.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connect Camera Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 text-xs font-medium transition-all hover:border-violet-500/40"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {connectedCameras.length > 0 ? 'Cameras' : 'Connect Camera'}
          </button>

          {/* Shooting Button */}
          {connectedCameras.length > 0 && !showShootingPanel && (
            <button
              onClick={handleOpenShooting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition-all hover:border-red-500/40"
            >
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              Shoot
            </button>
          )}

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
          connectedCameras={connectedCameras}
          onOpenShooting={handleOpenShooting}
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
            onOpenShooting={handleOpenShooting}
            hasCamera={connectedCameras.length > 0}
          />

          {/* Image Grid */}
          <ImageGrid 
            images={filteredImages}
            gridSize={gridSize}
            selectedImages={selectedImages}
            onImageClick={handleImageClick}
          />

          {/* Shooting Panel */}
          {showShootingPanel && activeCamera && (
            <ShootingPanel 
              camera={activeCamera}
              onClose={() => setShowShootingPanel(false)}
              onCapture={handleCapture}
            />
          )}
        </div>

        {/* Detail Panel */}
        {showDetailPanel && activeImage && (
          <DetailPanel 
            image={activeImage}
            onClose={() => setShowDetailPanel(false)}
          />
        )}
      </div>

      {/* Camera Connect Modal */}
      <CameraConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        cameras={cameras}
        onConnect={handleConnectCamera}
        onDisconnect={handleDisconnectCamera}
      />
    </div>
  );
}
