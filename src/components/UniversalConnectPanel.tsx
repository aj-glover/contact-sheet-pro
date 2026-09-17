import { useState, useEffect } from 'react';
import { UnifiedCameraClient, UnifiedCameraConfig, UnifiedCameraInfo, CameraManufacturer, createUnifiedCameraClient } from '../services/unified-camera';

interface UniversalConnectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (client: UnifiedCameraClient, info: UnifiedCameraInfo) => void;
  onDisconnected: () => void;
  connectionInfo: { client: UnifiedCameraClient; info: UnifiedCameraInfo } | null;
}

const MANUFACTURERS: { id: CameraManufacturer; name: string; color: string; bgColor: string; borderColor: string; textColor: string; apiName: string; description: string }[] = [
  {
    id: 'canon',
    name: 'Canon',
    color: 'red',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    apiName: 'CCAPI',
    description: 'Camera Control API (REST over HTTP)',
  },
  {
    id: 'sony',
    name: 'Sony',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    apiName: 'Camera Remote API',
    description: 'Alpha REST API or Smart Remote Control',
  },
  {
    id: 'nikon',
    name: 'Nikon',
    color: 'yellow',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-400',
    apiName: 'Nikon WiFi Control',
    description: 'Z-series WiFi / Wireless Transmitter',
  },
  {
    id: 'fujifilm',
    name: 'Fujifilm',
    color: 'green',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    apiName: 'Camera Control SDK',
    description: 'XApp protocol / USB Tethering',
  },
];

const DEFAULT_PORTS: Record<CameraManufacturer, number> = {
  canon: 8080,
  sony: 8080,
  nikon: 8080,
  fujifilm: 5555,
};

export default function UniversalConnectPanel({
  isOpen,
  onClose,
  onConnected,
  onDisconnected,
  connectionInfo,
}: UniversalConnectPanelProps) {
  const [selectedManufacturer, setSelectedManufacturer] = useState<CameraManufacturer>('canon');
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('8080');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sonyMode, setSonyMode] = useState<'legacy' | 'rest'>('rest');
  const [savedCameras, setSavedCameras] = useState<UnifiedCameraConfig[]>(() => {
    try {
      const saved = localStorage.getItem('universal_saved_cameras');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    setPort(String(DEFAULT_PORTS[selectedManufacturer]));
  }, [selectedManufacturer]);

  useEffect(() => {
    if (connectionInfo) {
      setIpAddress(connectionInfo.info.modelName ? '' : '');
    }
  }, [connectionInfo]);

  const handleConnect = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter a camera IP address');
      return;
    }

    setConnecting(true);
    setError(null);

    const config: UnifiedCameraConfig = {
      manufacturer: selectedManufacturer,
      ipAddress: ipAddress.trim(),
      port: parseInt(port) || DEFAULT_PORTS[selectedManufacturer],
      sonyMode: selectedManufacturer === 'sony' ? sonyMode : undefined,
    };

    const client = createUnifiedCameraClient(config);

    try {
      const isReachable = await client.ping();
      if (!isReachable) {
        throw new Error(`Cannot reach ${client.getManufacturerName()} camera. Check IP address and ensure the camera API is enabled.`);
      }

      const info = await client.getCameraInfo();

      // Save camera
      const newSaved = [...savedCameras.filter(c => !(c.ipAddress === config.ipAddress && c.manufacturer === config.manufacturer)), config];
      setSavedCameras(newSaved);
      localStorage.setItem('universal_saved_cameras', JSON.stringify(newSaved));

      onConnected(client, info);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (connectionInfo) {
      connectionInfo.client.disconnect();
    }
    onDisconnected();
  };

  const handleSelectSaved = (config: UnifiedCameraConfig) => {
    setSelectedManufacturer(config.manufacturer);
    setIpAddress(config.ipAddress);
    setPort(String(config.port));
    if (config.sonyMode) setSonyMode(config.sonyMode);
  };

  const handleRemoveSaved = (ip: string, mfr: CameraManufacturer) => {
    const updated = savedCameras.filter(c => !(c.ipAddress === ip && c.manufacturer === mfr));
    setSavedCameras(updated);
    localStorage.setItem('universal_saved_cameras', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  const isConnected = connectionInfo !== null;
  const currentMfr = MANUFACTURERS.find(m => m.id === selectedManufacturer)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#181825] rounded-2xl border border-[#313244] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Connect Camera</h2>
              <p className="text-xs text-[#6c7086]">Canon · Sony · Nikon · Fujifilm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6c7086] hover:text-white hover:bg-[#313244] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Connection Status */}
          {isConnected && connectionInfo && (
            <div className={`p-4 rounded-xl ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.bgColor} border ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.borderColor}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.bgColor} flex items-center justify-center`}>
                  <ManufacturerIcon manufacturer={connectionInfo.info.manufacturer} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-semibold ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.textColor}`}>
                      {connectionInfo.info.modelName}
                    </h4>
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.bgColor} ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.textColor} text-[10px] font-medium`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#6c7086] mt-0.5">
                    {MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.apiName} · Firmware {connectionInfo.info.firmwareVersion}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Camera Details */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className={`p-2.5 rounded-lg ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.bgColor} border ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.borderColor}`}>
                  <p className="text-[10px] text-[#6c7086] mb-0.5">Battery</p>
                  <p className={`text-xs font-semibold ${connectionInfo.info.batteryLevel > 50 ? 'text-emerald-400' : connectionInfo.info.batteryLevel > 20 ? 'text-amber-400' : 'text-red-400'}`}>
                    {connectionInfo.info.batteryLevel}%
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.bgColor} border ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.borderColor}`}>
                  <p className="text-[10px] text-[#6c7086] mb-0.5">Serial</p>
                  <p className="text-xs font-semibold text-white truncate">{connectionInfo.info.serialNumber}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.bgColor} border ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.borderColor}`}>
                  <p className="text-[10px] text-[#6c7086] mb-0.5">Manufacturer</p>
                  <p className={`text-xs font-semibold ${MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.textColor}`}>
                    {MANUFACTURERS.find(m => m.id === connectionInfo.info.manufacturer)?.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Manufacturer Selection */}
          {!isConnected && (
            <div>
              <label className="block text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">
                Camera Manufacturer
              </label>
              <div className="grid grid-cols-4 gap-2">
                {MANUFACTURERS.map((mfr) => (
                  <button
                    key={mfr.id}
                    onClick={() => setSelectedManufacturer(mfr.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                      selectedManufacturer === mfr.id
                        ? `${mfr.bgColor} ${mfr.borderColor} ${mfr.textColor}`
                        : 'bg-[#1e1e2e] border-[#313244] text-[#6c7086] hover:border-[#45475a] hover:text-white'
                    }`}
                  >
                    <ManufacturerIcon manufacturer={mfr.id} />
                    <span className="text-xs font-medium">{mfr.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#6c7086] mt-2">{currentMfr.description}</p>
            </div>
          )}

          {/* Connection Form */}
          {!isConnected && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">
                  Camera IP Address
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => { setIpAddress(e.target.value); setError(null); }}
                  placeholder="192.168.1.100"
                  className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-white placeholder-[#45475a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors font-mono"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder={String(DEFAULT_PORTS[selectedManufacturer])}
                    className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-white placeholder-[#45475a] focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors font-mono"
                  />
                </div>
                {selectedManufacturer === 'sony' && (
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">
                      API Mode
                    </label>
                    <select
                      value={sonyMode}
                      onChange={(e) => setSonyMode(e.target.value as 'legacy' | 'rest')}
                      className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    >
                      <option value="rest">Alpha REST API</option>
                      <option value="legacy">Smart Remote (JSON-RPC)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Saved Cameras */}
          {!isConnected && savedCameras.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">Saved Cameras</p>
              <div className="space-y-1.5">
                {savedCameras.map((cam) => {
                  const mfr = MANUFACTURERS.find(m => m.id === cam.manufacturer)!;
                  return (
                    <div
                      key={`${cam.manufacturer}-${cam.ipAddress}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1e1e2e] border border-[#313244] hover:border-[#45475a] transition-colors"
                    >
                      <button
                        onClick={() => handleSelectSaved(cam)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <div className={`w-6 h-6 rounded ${mfr.bgColor} flex items-center justify-center`}>
                          <ManufacturerIcon manufacturer={cam.manufacturer} small />
                        </div>
                        <div>
                          <span className="text-sm text-white font-mono">{cam.ipAddress}:{cam.port}</span>
                          <span className={`ml-2 text-[10px] ${mfr.textColor}`}>{mfr.name}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleRemoveSaved(cam.ipAddress, cam.manufacturer)}
                        className="w-6 h-6 rounded flex items-center justify-center text-[#6c7086] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Setup Instructions */}
          {!isConnected && (
            <SetupInstructions manufacturer={selectedManufacturer} />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#313244] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#6c7086]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Supports Canon, Sony, Nikon, and Fujifilm cameras</span>
          </div>
          {!isConnected && (
            <button
              onClick={handleConnect}
              disabled={connecting || !ipAddress.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentMfr.bgColor} ${currentMfr.borderColor} border ${currentMfr.textColor} disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors hover:opacity-80`}
            >
              {connecting ? (
                <>
                  <div className={`w-3.5 h-3.5 border-2 ${currentMfr.textColor} border-t-transparent rounded-full animate-spin`}></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connect
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ManufacturerIcon({ manufacturer, small = false }: { manufacturer: CameraManufacturer; small?: boolean }) {
  const size = small ? 'w-3 h-3' : 'w-4 h-4';
  
  switch (manufacturer) {
    case 'canon':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      );
    case 'sony':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M7 5V3M17 5V3" />
        </svg>
      );
    case 'nikon':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" d="M8 13h8M12 9v8" />
        </svg>
      );
    case 'fujifilm':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" d="M6 6V4h4v2" />
        </svg>
      );
  }
}

function SetupInstructions({ manufacturer }: { manufacturer: CameraManufacturer }) {
  const instructions: Record<CameraManufacturer, string[]> = {
    canon: [
      'Go to camera Menu → Network/Wi-Fi settings',
      'Enable "Camera Control API" (CCAPI)',
      'Note the camera\'s IP address shown on screen',
      'Enter the IP and port (default 8080) above',
    ],
    sony: [
      'For Alpha REST API: Run @alpha-sdk/api server on your computer',
      'Connect camera via USB or WiFi',
      'Use server URL (default: localhost:8080)',
      'For Smart Remote: Enable WiFi on camera, use camera\'s IP:10000',
    ],
    nikon: [
      'Enable WiFi on your Nikon Z-series camera',
      'Connect to the camera\'s WiFi network',
      'Note the IP address assigned to the camera',
      'Enter the IP and port above (default 8080)',
    ],
    fujifilm: [
      'Go to Menu → Network → PC Connection Settings',
      'Enable "PC Tethering" or install XApp',
      'Connect via WiFi or USB',
      'Note the IP address (default port: 5555)',
    ],
  };

  return (
    <div className="p-4 rounded-xl bg-[#1e1e2e] border border-[#313244]">
      <h4 className="text-xs font-semibold text-white mb-2">
        How to enable on your {MANUFACTURERS.find(m => m.id === manufacturer)?.name} camera
      </h4>
      <ol className="space-y-1.5 text-xs text-[#a6adc8]">
        {instructions[manufacturer].map((step, i) => (
          <li key={i} className="flex gap-2">
            <span className={`${MANUFACTURERS.find(m => m.id === manufacturer)?.textColor} font-bold`}>{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
