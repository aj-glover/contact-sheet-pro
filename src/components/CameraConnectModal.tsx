import { useState } from 'react';
import { CameraDevice, ConnectionType } from '../data/cameras';

interface CameraConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: CameraDevice[];
  onConnect: (cameraId: string, type: ConnectionType) => void;
  onDisconnect: (cameraId: string) => void;
}

export default function CameraConnectModal({ isOpen, onClose, cameras, onConnect, onDisconnect }: CameraConnectModalProps) {
  const [activeTab, setActiveTab] = useState<ConnectionType>('tethered');
  const [connectingId, setConnectingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const tetheredCameras = cameras.filter(c => c.connectionType === 'tethered');
  const wirelessCameras = cameras.filter(c => c.connectionType === 'wireless');
  const displayCameras = activeTab === 'tethered' ? tetheredCameras : wirelessCameras;

  const handleConnect = (cameraId: string) => {
    setConnectingId(cameraId);
    setTimeout(() => {
      onConnect(cameraId, activeTab);
      setConnectingId(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#181825] rounded-2xl border border-[#313244] shadow-2xl overflow-hidden">
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
              <p className="text-xs text-[#6c7086]">Tethered or wireless shooting</p>
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

        {/* Connection Type Tabs */}
        <div className="flex p-2 gap-1 mx-5 mt-4 bg-[#1e1e2e] rounded-xl border border-[#313244]">
          <button
            onClick={() => setActiveTab('tethered')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tethered'
                ? 'bg-violet-500/15 text-violet-300 shadow-sm'
                : 'text-[#6c7086] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Tethered (USB)
          </button>
          <button
            onClick={() => setActiveTab('wireless')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'wireless'
                ? 'bg-violet-500/15 text-violet-300 shadow-sm'
                : 'text-[#6c7086] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
            </svg>
            Wireless (WiFi)
          </button>
        </div>

        {/* Camera List */}
        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {displayCameras.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-[#313244] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm text-[#6c7086]">No cameras found</p>
              <p className="text-xs text-[#45475a] mt-1">Make sure your camera is powered on and discoverable</p>
            </div>
          ) : (
            displayCameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                connecting={connectingId === camera.id}
                onConnect={() => handleConnect(camera.id)}
                onDisconnect={() => onDisconnect(camera.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#313244] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#6c7086]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Scanning for devices...</span>
          </div>
          <button className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Scan Again
          </button>
        </div>
      </div>
    </div>
  );
}

interface CameraCardProps {
  camera: CameraDevice;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function CameraCard({ camera, connecting, onConnect, onDisconnect }: CameraCardProps) {
  const isConnected = camera.status === 'connected';
  const isConnecting = connecting;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isConnected 
        ? 'border-emerald-500/30 bg-emerald-500/5' 
        : 'border-[#313244] bg-[#1e1e2e] hover:border-[#45475a]'
    }`}>
      <div className="flex items-start gap-3">
        {/* Camera icon */}
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isConnected ? 'bg-emerald-500/15' : 'bg-[#313244]'
        }`}>
          <svg className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-[#6c7086]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white truncate">{camera.name}</h4>
            {isConnected && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected
              </span>
            )}
          </div>
          <p className="text-xs text-[#6c7086] mt-0.5">SN: {camera.serial}</p>
          
          {/* Connection details */}
          <div className="flex items-center gap-3 mt-2">
            {camera.connectionType === 'tethered' ? (
              <span className="flex items-center gap-1 text-[10px] text-[#a6adc8]">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {camera.port || 'USB'}
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1 text-[10px] text-[#a6adc8]">
                  <SignalIcon strength={camera.signalStrength || 0} />
                  {camera.signalStrength}%
                </span>
                <span className="text-[10px] text-[#a6adc8]">{camera.transferSpeed}</span>
              </>
            )}
            <span className="flex items-center gap-1 text-[10px] text-[#a6adc8]">
              <BatteryIcon level={camera.batteryLevel} />
              {camera.batteryLevel}%
            </span>
            <span className="text-[10px] text-[#a6adc8]">{camera.shotsRemaining} shots</span>
          </div>
        </div>

        {/* Action button */}
        <div className="shrink-0">
          {isConnecting ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 text-xs">
              <div className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </div>
          ) : isConnected ? (
            <button
              onClick={onDisconnect}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BatteryIcon({ level }: { level: number }) {
  const color = level > 50 ? 'text-emerald-400' : level > 20 ? 'text-amber-400' : 'text-red-400';
  return (
    <svg className={`w-3 h-3 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="7" width="18" height="10" rx="1" />
      <rect x="20" y="10" width="2" height="4" rx="0.5" fill="currentColor" />
      <rect x="4" y="9" width={Math.max(1, (level / 100) * 14)} height="6" rx="0.5" fill="currentColor" />
    </svg>
  );
}

function SignalIcon({ strength }: { strength: number }) {
  const color = strength > 60 ? 'text-emerald-400' : strength > 30 ? 'text-amber-400' : 'text-red-400';
  return (
    <svg className={`w-3 h-3 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0" />
    </svg>
  );
}
