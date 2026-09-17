import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ImageGrid from './components/ImageGrid';
import DetailPanel from './components/DetailPanel';
import CameraConnectModal from './components/CameraConnectModal';
import CanonConnectPanel from './components/CanonConnectPanel';
import ShootingPanel from './components/ShootingPanel';
import LiveViewPanel from './components/LiveViewPanel';
import { images, ImageItem } from './data/images';
import { availableCameras, CameraDevice, ConnectionType, CameraSettings, defaultCameraSettings } from './data/cameras';
import { CCApiClient, ShootingSettings as CCApiShootingSettings } from './services/ccapi';
import { CanonConnectionInfo } from './components/CanonConnectPanel';

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
  const [showCanonPanel, setShowCanonPanel] = useState(false);
  const [showShootingPanel, setShowShootingPanel] = useState(false);
  const [showLiveView, setShowLiveView] = useState(false);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(defaultCameraSettings);

  // Canon CCAPI state
  const [ccapiClient, setCcapiClient] = useState<CCApiClient | null>(null);
  const [ccapiConnectionInfo, setCcapiConnectionInfo] = useState<CanonConnectionInfo | null>(null);

  const connectedCameras = cameras.filter(c => c.status === 'connected');
  const activeCamera = cameras.find(c => c.id === activeCameraId) || null;
  const isCanonConnected = ccapiClient !== null && ccapiConnectionInfo?.connected;

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

  // Canon CCAPI handlers
  const handleCanonConnected = useCallback((client: CCApiClient, info: CanonConnectionInfo) => {
    setCcapiClient(client);
    setCcapiConnectionInfo(info);
    setShowCanonPanel(false);

    // Update camera settings from CCAPI
    if (info.settings) {
      const newSettings: CameraSettings = {
        aperture: info.settings.av?.currentDisplay || info.settings.av?.value || defaultCameraSettings.aperture,
        shutterSpeed: info.settings.tv?.currentDisplay || info.settings.tv?.value || defaultCameraSettings.shutterSpeed,
        iso: info.settings.iso?.currentDisplay || info.settings.iso?.value || defaultCameraSettings.iso,
        whiteBalance: info.settings.wb?.currentDisplay || info.settings.wb?.value || defaultCameraSettings.whiteBalance,
        focusMode: info.settings.afmethod?.currentDisplay || info.settings.afmethod?.value || defaultCameraSettings.focusMode,
        driveMode: info.settings.drive?.currentDisplay || info.settings.drive?.value || defaultCameraSettings.driveMode,
        meteringMode: info.settings.metering?.currentDisplay || info.settings.metering?.value || defaultCameraSettings.meteringMode,
        imageQuality: info.settings.stillimagequality?.currentDisplay || info.settings.stillimagequality?.value || defaultCameraSettings.imageQuality,
      };
      setCameraSettings(newSettings);
    }

    // Auto-open shooting panel when Canon connects
    setShowShootingPanel(true);
  }, []);

  const handleCanonDisconnected = useCallback(() => {
    setCcapiClient(null);
    setCcapiConnectionInfo(null);
    setShowShootingPanel(false);
    setShowLiveView(false);
  }, []);

  const handleCapture = useCallback(async () => {
    if (ccapiClient) {
      try {
        await ccapiClient.capture();
      } catch (err) {
        console.error('CCAPI capture failed:', err);
      }
    }
  }, [ccapiClient]);

  const handleSettingsChange = useCallback(async (newSettings: CameraSettings) => {
    setCameraSettings(newSettings);
    
    if (ccapiClient) {
      try {
        // Sync settings to camera via CCAPI
        if (newSettings.aperture !== cameraSettings.aperture) {
          await ccapiClient.setAperture(newSettings.aperture);
        }
        if (newSettings.shutterSpeed !== cameraSettings.shutterSpeed) {
          await ccapiClient.setShutterSpeed(newSettings.shutterSpeed);
        }
        if (newSettings.iso !== cameraSettings.iso) {
          await ccapiClient.setISO(newSettings.iso);
        }
        if (newSettings.whiteBalance !== cameraSettings.whiteBalance) {
          await ccapiClient.setWhiteBalance(newSettings.whiteBalance);
        }
        if (newSettings.meteringMode !== cameraSettings.meteringMode) {
          await ccapiClient.setMetering(newSettings.meteringMode);
        }
        if (newSettings.driveMode !== cameraSettings.driveMode) {
          await ccapiClient.setDriveMode(newSettings.driveMode);
        }
        if (newSettings.imageQuality !== cameraSettings.imageQuality) {
          await ccapiClient.setImageQuality(newSettings.imageQuality);
        }
      } catch (err) {
        console.error('CCAPI settings sync failed:', err);
      }
    }
  }, [ccapiClient, cameraSettings]);

  const handleOpenShooting = () => {
    if (isCanonConnected) {
      setShowShootingPanel(true);
    } else if (connectedCameras.length > 0) {
      setActiveCameraId(connectedCameras[0].id);
      setShowShootingPanel(true);
    } else {
      setShowCanonPanel(true);
    }
  };

  const handleOpenLiveView = async () => {
    if (ccapiClient) {
      try {
        await ccapiClient.startLiveView();
      } catch (err) {
        console.error('Failed to start live view:', err);
      }
    }
    setShowLiveView(true);
  };

  const handleCloseLiveView = async () => {
    if (ccapiClient) {
      try {
        await ccapiClient.stopLiveView();
      } catch (err) {
        console.error('Failed to stop live view:', err);
      }
    }
    setShowLiveView(false);
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
          {(connectedCameras.length > 0 || isCanonConnected) && (
            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-[#313244]">
              {isCanonConnected && ccapiConnectionInfo?.deviceInfo && (
                <button
                  onClick={handleOpenShooting}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  title={`Canon ${ccapiConnectionInfo.deviceInfo.productname}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                  <span className="text-[11px] text-red-300 font-medium">
                    {ccapiConnectionInfo.deviceInfo.productname.split(' ').slice(0, 2).join(' ')}
                  </span>
                  <span className="text-[9px] text-red-400/60 font-mono">CCAPI</span>
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
          {/* Canon CCAPI Button */}
          <button
            onClick={() => setShowCanonPanel(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isCanonConnected
                ? 'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20'
                : 'bg-red-500/5 border-red-500/15 text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {isCanonConnected ? 'Canon Connected' : 'Canon CCAPI'}
          </button>

          {/* Generic Camera Connect */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-300 text-xs font-medium transition-all hover:border-violet-500/40"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {connectedCameras.length > 0 ? 'Cameras' : 'Connect'}
          </button>

          {/* Live View Button */}
          {(isCanonConnected || connectedCameras.length > 0) && (
            <button
              onClick={handleOpenLiveView}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 text-xs font-medium transition-all hover:border-red-500/40"
            >
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              Live View
            </button>
          )}

          {/* Shooting Button */}
          {(isCanonConnected || connectedCameras.length > 0) && !showShootingPanel && (
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
            hasCamera={isCanonConnected || connectedCameras.length > 0}
          />

          {/* Image Grid */}
          <ImageGrid 
            images={filteredImages}
            gridSize={gridSize}
            selectedImages={selectedImages}
            onImageClick={handleImageClick}
          />

          {/* Shooting Panel */}
          {showShootingPanel && (isCanonConnected || activeCamera) && (
            <ShootingPanel 
              camera={activeCamera || {
                id: 'ccapi',
                name: ccapiConnectionInfo?.deviceInfo?.productname || 'Canon Camera',
                model: ccapiConnectionInfo?.deviceInfo?.productname || 'Canon',
                serial: ccapiConnectionInfo?.deviceInfo?.uniqueid || 'CCAPI',
                connectionType: 'wireless',
                status: 'connected',
                batteryLevel: ccapiConnectionInfo?.battery?.level || 100,
                storageUsed: 0,
                storageTotal: 128,
                shotsRemaining: 9999,
                signalStrength: 100,
                transferSpeed: 'CCAPI',
                firmware: ccapiConnectionInfo?.deviceInfo?.firmwareversion || '1.0',
              }}
              onClose={() => setShowShootingPanel(false)}
              onCapture={handleCapture}
              onOpenLiveView={handleOpenLiveView}
              settings={cameraSettings}
              onSettingsChange={handleSettingsChange}
              ccapiClient={ccapiClient}
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

      {/* Camera Connect Modal (Generic) */}
      <CameraConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        cameras={cameras}
        onConnect={handleConnectCamera}
        onDisconnect={handleDisconnectCamera}
      />

      {/* Canon CCAPI Panel */}
      <CanonConnectPanel
        isOpen={showCanonPanel}
        onClose={() => setShowCanonPanel(false)}
        onConnected={handleCanonConnected}
        onDisconnected={handleCanonDisconnected}
        connectionInfo={ccapiConnectionInfo}
        client={ccapiClient}
      />

      {/* Live View Panel */}
      {showLiveView && (isCanonConnected || activeCamera) && (
        <LiveViewPanel
          camera={activeCamera || {
            id: 'ccapi',
            name: ccapiConnectionInfo?.deviceInfo?.productname || 'Canon Camera',
            model: ccapiConnectionInfo?.deviceInfo?.productname || 'Canon',
            serial: ccapiConnectionInfo?.deviceInfo?.uniqueid || 'CCAPI',
            connectionType: 'wireless',
            status: 'connected',
            batteryLevel: ccapiConnectionInfo?.battery?.level || 100,
            storageUsed: 0,
            storageTotal: 128,
            shotsRemaining: 9999,
            signalStrength: 100,
            transferSpeed: 'CCAPI',
            firmware: ccapiConnectionInfo?.deviceInfo?.firmwareversion || '1.0',
          }}
          settings={cameraSettings}
          onClose={handleCloseLiveView}
          onCapture={handleCapture}
          ccapiClient={ccapiClient}
        />
      )}
    </div>
  );
}
