import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ImageGrid from './components/ImageGrid';
import DetailPanel from './components/DetailPanel';
import CameraConnectModal from './components/CameraConnectModal';
import UniversalConnectPanel from './components/UniversalConnectPanel';
import ShootingPanel from './components/ShootingPanel';
import LiveViewPanel from './components/LiveViewPanel';
import { images, ImageItem } from './data/images';
import { availableCameras, CameraDevice, ConnectionType, CameraSettings, defaultCameraSettings } from './data/cameras';
import { UnifiedCameraClient, UnifiedCameraInfo } from './services/unified-camera';

export default function App() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImage, setActiveImage] = useState<ImageItem | null>(null);
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  
  // Generic camera state (simulated)
  const [cameras, setCameras] = useState<CameraDevice[]>(availableCameras);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  // Universal camera API state
  const [showUniversalPanel, setShowUniversalPanel] = useState(false);
  const [cameraClient, setCameraClient] = useState<UnifiedCameraClient | null>(null);
  const [cameraInfo, setCameraInfo] = useState<UnifiedCameraInfo | null>(null);
  
  // Shooting/LiveView state
  const [showShootingPanel, setShowShootingPanel] = useState(false);
  const [showLiveView, setShowLiveView] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(defaultCameraSettings);

  const connectedCameras = cameras.filter(c => c.status === 'connected');
  const activeCamera = cameras.find(c => c.id === activeCameraId) || null;
  const isApiCameraConnected = cameraClient !== null && cameraInfo !== null;

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
      setShowLiveView(false);
    }
  }, [activeCameraId]);

  // Universal API camera handlers
  const handleCameraConnected = useCallback(async (client: UnifiedCameraClient, info: UnifiedCameraInfo) => {
    setCameraClient(client);
    setCameraInfo(info);
    setShowUniversalPanel(false);

    // Fetch settings from camera
    try {
      const settings = await client.getSettings();
      setCameraSettings({
        aperture: settings.aperture,
        shutterSpeed: settings.shutterSpeed,
        iso: settings.iso,
        whiteBalance: settings.whiteBalance,
        focusMode: settings.focusMode,
        driveMode: settings.driveMode,
        meteringMode: settings.meteringMode,
        imageQuality: settings.imageQuality,
      });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }

    setShowShootingPanel(true);
  }, []);

  const handleCameraDisconnected = useCallback(() => {
    setCameraClient(null);
    setCameraInfo(null);
    setShowShootingPanel(false);
    setShowLiveView(false);
  }, []);

  const handleCapture = useCallback(async () => {
    if (cameraClient) {
      try {
        await cameraClient.capture();
      } catch (err) {
        console.error('Capture failed:', err);
      }
    }
  }, [cameraClient]);

  const handleSettingsChange = useCallback(async (newSettings: CameraSettings) => {
    setCameraSettings(newSettings);
    
    if (cameraClient) {
      try {
        if (newSettings.aperture !== cameraSettings.aperture) {
          await cameraClient.setAperture(newSettings.aperture);
        }
        if (newSettings.shutterSpeed !== cameraSettings.shutterSpeed) {
          await cameraClient.setShutterSpeed(newSettings.shutterSpeed);
        }
        if (newSettings.iso !== cameraSettings.iso) {
          await cameraClient.setISO(newSettings.iso);
        }
        if (newSettings.whiteBalance !== cameraSettings.whiteBalance) {
          await cameraClient.setWhiteBalance(newSettings.whiteBalance);
        }
        if (newSettings.meteringMode !== cameraSettings.meteringMode) {
          await cameraClient.setMeteringMode(newSettings.meteringMode);
        }
        if (newSettings.driveMode !== cameraSettings.driveMode) {
          await cameraClient.setDriveMode(newSettings.driveMode);
        }
        if (newSettings.imageQuality !== cameraSettings.imageQuality) {
          await cameraClient.setImageQuality(newSettings.imageQuality);
        }
      } catch (err) {
        console.error('Settings sync failed:', err);
      }
    }
  }, [cameraClient, cameraSettings]);

  const handleOpenShooting = () => {
    if (isApiCameraConnected) {
      setShowShootingPanel(true);
    } else if (connectedCameras.length > 0) {
      setActiveCameraId(connectedCameras[0].id);
      setShowShootingPanel(true);
    } else {
      setShowUniversalPanel(true);
    }
  };

  const handleOpenLiveView = async () => {
    if (cameraClient) {
      try {
        await cameraClient.startLiveView();
      } catch (err) {
        console.error('Failed to start live view:', err);
      }
    }
    setShowLiveView(true);
  };

  const handleCloseLiveView = async () => {
    if (cameraClient) {
      try {
        await cameraClient.stopLiveView();
      } catch (err) {
        console.error('Failed to stop live view:', err);
      }
    }
    setShowLiveView(false);
  };

  // Build display camera for API-connected cameras
  const getDisplayCamera = (): CameraDevice => {
    if (activeCamera) return activeCamera;
    if (cameraInfo) {
      const mfrColors: Record<string, string> = {
        canon: 'from-red-500 to-red-700',
        sony: 'from-blue-500 to-blue-700',
        nikon: 'from-yellow-500 to-yellow-700',
        fujifilm: 'from-emerald-500 to-emerald-700',
      };
      return {
        id: 'api-camera',
        name: cameraInfo.modelName,
        model: cameraInfo.modelName,
        serial: cameraInfo.serialNumber,
        connectionType: 'wireless',
        status: 'connected',
        batteryLevel: cameraInfo.batteryLevel,
        storageUsed: 0,
        storageTotal: 128,
        shotsRemaining: 9999,
        signalStrength: 100,
        transferSpeed: cameraClient?.getManufacturerName() || 'API',
        firmware: cameraInfo.firmwareVersion,
      };
    }
    return connectedCameras[0] || availableCameras[0];
  };

  const displayCamera = getDisplayCamera();
  const hasAnyCamera = isApiCameraConnected || connectedCameras.length > 0;

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
          {hasAnyCamera && (
            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-[#313244]">
              {isApiCameraConnected && cameraInfo && (
                <button
                  onClick={handleOpenShooting}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
                  title={cameraInfo.modelName}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                  <span className="text-[11px] text-violet-300 font-medium">
                    {cameraInfo.modelName.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="text-[9px] text-violet-400/60 font-mono uppercase">
                    {cameraClient?.getManufacturer()}
                  </span>
                </button>
              )}
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
        
        <div className="flex items-center gap-2">
          {/* Connect Camera Button */}
          <button
            onClick={() => setShowUniversalPanel(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isApiCameraConnected
                ? 'bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/20'
                : 'bg-violet-500/5 border-violet-500/15 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/30'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isApiCameraConnected ? `${cameraClient?.getManufacturerName()} Connected` : 'Connect Camera'}
          </button>

          {/* Live View Button */}
          {hasAnyCamera && (
            <button
              onClick={handleOpenLiveView}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition-all hover:border-red-500/40"
            >
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              Live View
            </button>
          )}

          {/* Shooting Button */}
          {hasAnyCamera && !showShootingPanel && (
            <button
              onClick={handleOpenShooting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition-all hover:border-red-500/40"
            >
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              Shoot
            </button>
          )}

          <span className="text-sm text-[#a6adc8] ml-2">
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
            hasCamera={hasAnyCamera}
          />

          {/* Image Grid */}
          <ImageGrid 
            images={filteredImages}
            gridSize={gridSize}
            selectedImages={selectedImages}
            onImageClick={handleImageClick}
          />

          {/* Shooting Panel */}
          {showShootingPanel && hasAnyCamera && (
            <ShootingPanel 
              camera={displayCamera}
              onClose={() => setShowShootingPanel(false)}
              onCapture={handleCapture}
              onOpenLiveView={handleOpenLiveView}
              settings={cameraSettings}
              onSettingsChange={handleSettingsChange}
              ccapiClient={cameraClient}
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

      {/* Generic Camera Connect Modal */}
      <CameraConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        cameras={cameras}
        onConnect={handleConnectCamera}
        onDisconnect={handleDisconnectCamera}
      />

      {/* Universal Camera Connect Panel */}
      <UniversalConnectPanel
        isOpen={showUniversalPanel}
        onClose={() => setShowUniversalPanel(false)}
        onConnected={handleCameraConnected}
        onDisconnected={handleCameraDisconnected}
        connectionInfo={cameraClient && cameraInfo ? { client: cameraClient, info: cameraInfo } : null}
      />

      {/* Live View Panel */}
      {showLiveView && hasAnyCamera && (
        <LiveViewPanel
          camera={displayCamera}
          settings={cameraSettings}
          onClose={handleCloseLiveView}
          onCapture={handleCapture}
          ccapiClient={cameraClient}
        />
      )}
    </div>
  );
}
