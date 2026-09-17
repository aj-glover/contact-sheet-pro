import { useState, useEffect, useCallback } from 'react';
import { CCApiClient, CCAPIConfig, DeviceInfo, BatteryInfo, StorageInfo, LensInfo, ShootingSettings, SettingValue } from '../services/ccapi';

interface CanonConnectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (client: CCApiClient, info: CanonConnectionInfo) => void;
  onDisconnected: () => void;
  connectionInfo: CanonConnectionInfo | null;
  client: CCApiClient | null;
}

export interface CanonConnectionInfo {
  config: CCAPIConfig;
  deviceInfo: DeviceInfo | null;
  battery: BatteryInfo | null;
  storage: StorageInfo | null;
  lens: LensInfo | null;
  settings: ShootingSettings | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
}

export default function CanonConnectPanel({
  isOpen,
  onClose,
  onConnected,
  onDisconnected,
  connectionInfo,
  client,
}: CanonConnectPanelProps) {
  const [ipAddress, setIpAddress] = useState('');
  const [port, setPort] = useState('8080');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedCameras, setSavedCameras] = useState<CCAPIConfig[]>(() => {
    try {
      const saved = localStorage.getItem('ccapi_saved_cameras');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load saved IP if available
  useEffect(() => {
    if (connectionInfo?.config) {
      setIpAddress(connectionInfo.config.ipAddress);
      setPort(String(connectionInfo.config.port));
    }
  }, [connectionInfo]);

  const handleConnect = async () => {
    if (!ipAddress.trim()) {
      setError('Please enter a camera IP address');
      return;
    }

    setConnecting(true);
    setError(null);

    const config: CCAPIConfig = {
      ipAddress: ipAddress.trim(),
      port: parseInt(port) || 8080,
    };

    const newClient = new CCApiClient(config);

    try {
      // Test connection
      const isReachable = await newClient.ping();
      if (!isReachable) {
        throw new Error('Cannot reach camera. Check IP address and ensure CCAPI is enabled.');
      }

      // Fetch device info
      const deviceInfo = await newClient.getDeviceInfo();
      
      // Fetch battery
      let battery: BatteryInfo | null = null;
      try {
        battery = await newClient.getBattery();
      } catch { /* optional */ }

      // Fetch storage
      let storage: StorageInfo | null = null;
      try {
        storage = await newClient.getStorage();
      } catch { /* optional */ }

      // Fetch lens
      let lens: LensInfo | null = null;
      try {
        lens = await newClient.getLens();
      } catch { /* optional */ }

      // Fetch settings
      let settings: ShootingSettings | null = null;
      try {
        settings = await newClient.getAllSettings();
      } catch { /* optional */ }

      const info: CanonConnectionInfo = {
        config,
        deviceInfo,
        battery,
        storage,
        lens,
        settings,
        connected: true,
        connecting: false,
        error: null,
      };

      // Save camera to local storage
      const newSaved = [...savedCameras.filter(c => c.ipAddress !== config.ipAddress), config];
      setSavedCameras(newSaved);
      localStorage.setItem('ccapi_saved_cameras', JSON.stringify(newSaved));

      onConnected(newClient, info);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (client) {
      client.disconnect();
    }
    onDisconnected();
  };

  const handleSelectSaved = (config: CCAPIConfig) => {
    setIpAddress(config.ipAddress);
    setPort(String(config.port));
  };

  const handleRemoveSaved = (ip: string) => {
    const updated = savedCameras.filter(c => c.ipAddress !== ip);
    setSavedCameras(updated);
    localStorage.setItem('ccapi_saved_cameras', JSON.stringify(updated));
  };

  if (!isOpen) return null;

  const isConnected = connectionInfo?.connected ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#181825] rounded-2xl border border-[#313244] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Canon CCAPI Connection</h2>
              <p className="text-xs text-[#6c7086]">Camera Control API over HTTP</p>
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

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Connection Status */}
          {isConnected && connectionInfo?.deviceInfo && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-emerald-300">{connectionInfo.deviceInfo.productname}</h4>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-[#6c7086] mt-0.5">
                    Firmware {connectionInfo.deviceInfo.firmwareversion || 'Unknown'} · {connectionInfo.config.ipAddress}:{connectionInfo.config.port}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Camera Details Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {connectionInfo.battery && (
                  <InfoCard
                    icon="battery"
                    label="Battery"
                    value={`${connectionInfo.battery.level}%`}
                    status={connectionInfo.battery.level > 50 ? 'good' : connectionInfo.battery.level > 20 ? 'warn' : 'bad'}
                  />
                )}
                {connectionInfo.lens && (
                  <InfoCard
                    icon="lens"
                    label="Lens"
                    value={connectionInfo.lens.name || `FL ${connectionInfo.lens.focallength}mm`}
                  />
                )}
                {connectionInfo.storage && (
                  <InfoCard
                    icon="storage"
                    label="Storage"
                    value={formatStorage(connectionInfo.storage)}
                  />
                )}
              </div>

              {/* Current Settings */}
              {connectionInfo.settings && (
                <div className="mt-4 pt-4 border-t border-emerald-500/10">
                  <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wider mb-2">Current Settings</p>
                  <div className="flex flex-wrap gap-2">
                    {connectionInfo.settings.av && (
                      <SettingBadge label="AV" value={connectionInfo.settings.av.currentDisplay || connectionInfo.settings.av.value} />
                    )}
                    {connectionInfo.settings.tv && (
                      <SettingBadge label="TV" value={connectionInfo.settings.tv.currentDisplay || connectionInfo.settings.tv.value} />
                    )}
                    {connectionInfo.settings.iso && (
                      <SettingBadge label="ISO" value={connectionInfo.settings.iso.currentDisplay || connectionInfo.settings.iso.value} />
                    )}
                    {connectionInfo.settings.wb && (
                      <SettingBadge label="WB" value={connectionInfo.settings.wb.currentDisplay || connectionInfo.settings.wb.value} />
                    )}
                    {connectionInfo.settings.metering && (
                      <SettingBadge label="Meter" value={connectionInfo.settings.metering.currentDisplay || connectionInfo.settings.metering.value} />
                    )}
                    {connectionInfo.settings.stillimagequality && (
                      <SettingBadge label="Quality" value={connectionInfo.settings.stillimagequality.currentDisplay || connectionInfo.settings.stillimagequality.value} />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connection Form */}
          {!isConnected && (
            <>
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
                    className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-white placeholder-[#45475a] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="8080"
                    className="w-full px-4 py-2.5 bg-[#1e1e2e] border border-[#313244] rounded-lg text-sm text-white placeholder-[#45475a] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Saved Cameras */}
              {savedCameras.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-2">Saved Cameras</p>
                  <div className="space-y-1.5">
                    {savedCameras.map((cam) => (
                      <div
                        key={cam.ipAddress}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[#1e1e2e] border border-[#313244] hover:border-[#45475a] transition-colors"
                      >
                        <button
                          onClick={() => handleSelectSaved(cam)}
                          className="flex-1 flex items-center gap-2 text-left"
                        >
                          <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center">
                            <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            </svg>
                          </div>
                          <span className="text-sm text-white font-mono">{cam.ipAddress}:{cam.port}</span>
                        </button>
                        <button
                          onClick={() => handleRemoveSaved(cam.ipAddress)}
                          className="w-6 h-6 rounded flex items-center justify-center text-[#6c7086] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Advanced Options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-xs text-[#6c7086] hover:text-white transition-colors"
                >
                  <svg className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced
                </button>
                {showAdvanced && (
                  <div className="mt-2 p-3 rounded-lg bg-[#1e1e2e] border border-[#313244] space-y-2 text-xs text-[#a6adc8]">
                    <p><strong className="text-white">Base URL:</strong> <code className="text-red-400">http://{ipAddress || '[IP]'}:{port || '8080'}/ccapi/ver100</code></p>
                    <p><strong className="text-white">API Version:</strong> ver100</p>
                    <p className="text-[#6c7086]">Ensure your Canon camera has CCAPI enabled in its WiFi/network settings. The camera must be on the same network as this device.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* How to Enable CCAPI */}
          {!isConnected && (
            <div className="p-4 rounded-xl bg-[#1e1e2e] border border-[#313244]">
              <h4 className="text-xs font-semibold text-white mb-2">How to enable CCAPI on your Canon camera</h4>
              <ol className="space-y-1.5 text-xs text-[#a6adc8]">
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">1.</span>
                  <span>Go to camera Menu → Network/Wi-Fi settings</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">2.</span>
                  <span>Enable "Camera Control API" (CCAPI)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">3.</span>
                  <span>Note the camera's IP address shown on screen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-400 font-bold">4.</span>
                  <span>Enter the IP and port (default 8080) above</span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#313244] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#6c7086]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Compatible with EOS R series, PowerShot, and more</span>
          </div>
          {!isConnected && (
            <button
              onClick={handleConnect}
              disabled={connecting || !ipAddress.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {connecting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

function InfoCard({ icon, label, value, status }: {
  icon: string;
  label: string;
  value: string;
  status?: 'good' | 'warn' | 'bad';
}) {
  const statusColor = status === 'good' ? 'text-emerald-400' : status === 'warn' ? 'text-amber-400' : status === 'bad' ? 'text-red-400' : 'text-white';
  
  return (
    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
      <p className="text-[10px] text-[#6c7086] mb-0.5">{label}</p>
      <p className={`text-xs font-semibold ${statusColor} truncate`}>{value}</p>
    </div>
  );
}

function SettingBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-1 rounded-md bg-emerald-500/5 border border-emerald-500/15">
      <span className="text-[9px] text-emerald-400/60 mr-1">{label}:</span>
      <span className="text-[11px] text-emerald-300 font-medium">{value}</span>
    </div>
  );
}

function formatStorage(storage: StorageInfo): string {
  if (!storage.storages || storage.storages.length === 0) return 'No storage';
  const s = storage.storages[0];
  if (s.spaces && s.spaces.length > 0) {
    const space = s.spaces[0];
    const used = space.maxcapacity ? `${((space.maxcapacity - (space.numfiles || 0) * 40) / 1024).toFixed(1)} GB free` : '';
    return `${space.numfiles || 0} files${used ? ` · ${used}` : ''}`;
  }
  return `${s.label || 'Card'}`;
}
