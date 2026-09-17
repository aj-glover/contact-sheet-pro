import { useState } from 'react';
import { CameraDevice, CameraSettings, defaultCameraSettings } from '../data/cameras';
import { UnifiedCameraClient } from '../services/unified-camera';

interface ShootingPanelProps {
  camera: CameraDevice;
  onClose: () => void;
  onCapture: () => void;
  onOpenLiveView: () => void;
  settings: CameraSettings;
  onSettingsChange: (settings: CameraSettings) => void;
  ccapiClient?: UnifiedCameraClient | null;
}

export default function ShootingPanel({ camera, onClose, onCapture, onOpenLiveView, settings, onSettingsChange, ccapiClient }: ShootingPanelProps) {
  const isCCAPI = ccapiClient !== null && ccapiClient !== undefined;
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureFlash, setCaptureFlash] = useState(false);
  const [liveViewActive, setLiveViewActive] = useState(false);
  const [autoImport, setAutoImport] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sessionShots, setSessionShots] = useState(0);
  const [transferring, setTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);

  const handleCapture = async () => {
    setIsCapturing(true);
    setCaptureFlash(true);
    
    try {
      if (isCCAPI && ccapiClient) {
        // Use real CCAPI capture
        await ccapiClient.capture();
      } else {
        // Simulate shutter
        await new Promise(resolve => setTimeout(resolve, 150));
      }
    } catch (err) {
      console.error('Capture failed:', err);
    }
    
    setCaptureFlash(false);
    setIsCapturing(false);
    setSessionShots(prev => prev + 1);
    onCapture();
    
    // Simulate transfer
    if (autoImport) {
      setTransferring(true);
      setTransferProgress(0);
      const interval = setInterval(() => {
        setTransferProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setTransferring(false), 300);
            return 100;
          }
          return prev + 8;
        });
      }, 50);
    }
  };

  const handleLiveViewToggle = () => {
    if (!liveViewActive) {
      setLiveViewActive(true);
      onOpenLiveView();
    } else {
      setLiveViewActive(false);
    }
  };

  return (
    <div className="bg-[#181825] border-t border-[#313244] shrink-0">
      {/* Flash effect */}
      {captureFlash && (
        <div className="fixed inset-0 bg-white/10 z-50 pointer-events-none animate-pulse"></div>
      )}

      {/* Main shooting bar */}
      <div className="flex items-center gap-4 px-5 py-3">
        {/* Camera Status */}
        <div className="flex items-center gap-3 pr-4 border-r border-[#313244]">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#181825]"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-white">{camera.name}</p>
              {isCCAPI && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[9px] font-bold tracking-wide">
                  CCAPI
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#6c7086] capitalize flex items-center gap-1">
              {isCCAPI ? (
                <>
                  <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  </svg>
                  {ccapiClient?.getManufacturerName()} API
                </>
              ) : camera.connectionType === 'tethered' ? (
                <>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  </svg>
                  Tethered via {camera.port}
                </>
              ) : (
                <>
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01" />
                  </svg>
                  Wireless · {camera.transferSpeed}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Camera Settings Quick View */}
        <div className="flex items-center gap-1 pr-4 border-r border-[#313244]">
          <SettingPill label="AP" value={settings.aperture} />
          <SettingPill label="SS" value={settings.shutterSpeed} />
          <SettingPill label="ISO" value={settings.iso} />
          <SettingPill label="WB" value={settings.whiteBalance} />
        </div>

        {/* Live View & Capture */}
        <div className="flex items-center gap-3 flex-1">
          {/* Live View Toggle */}
          <button
            onClick={handleLiveViewToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              liveViewActive
                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                : 'bg-[#313244] text-[#6c7086] hover:text-white'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${liveViewActive ? 'bg-red-400 animate-pulse' : 'bg-[#6c7086]'}`}></div>
            Live View
          </button>

          {/* Capture Button */}
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="relative group"
          >
            <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all ${
              isCapturing 
                ? 'border-white/50 scale-90' 
                : 'border-white/30 hover:border-white/60 group-hover:scale-105'
            }`}>
              <div className={`w-9 h-9 rounded-full transition-all ${
                isCapturing 
                  ? 'bg-white scale-75' 
                  : 'bg-white group-hover:bg-red-400 group-active:scale-90'
              }`}></div>
            </div>
          </button>

          {/* Session info */}
          <div className="flex items-center gap-4 ml-2">
            <div className="text-center">
              <p className="text-lg font-bold text-white leading-none">{sessionShots}</p>
              <p className="text-[10px] text-[#6c7086]">Session</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400 leading-none">{camera.shotsRemaining}</p>
              <p className="text-[10px] text-[#6c7086]">Remaining</p>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 pl-4 border-l border-[#313244]">
          {/* Auto Import */}
          <button
            onClick={() => setAutoImport(!autoImport)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
              autoImport
                ? 'bg-violet-500/10 text-violet-300'
                : 'bg-[#313244] text-[#6c7086] hover:text-white'
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Auto Import
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              showSettings ? 'bg-[#313244] text-white' : 'text-[#6c7086] hover:text-white hover:bg-[#313244]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Battery */}
          <div className="flex items-center gap-1.5 px-2">
            <BatteryBar level={camera.batteryLevel} />
            <span className="text-[10px] text-[#6c7086]">{camera.batteryLevel}%</span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6c7086] hover:text-white hover:bg-[#313244] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Transfer progress bar */}
      {transferring && (
        <div className="px-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-[#313244] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-100"
                style={{ width: `${transferProgress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-[#a6adc8] whitespace-nowrap">
              Importing... {transferProgress}%
            </span>
          </div>
        </div>
      )}

      {/* Expanded Settings Panel */}
      {showSettings && (
        <div className="px-5 pb-4 pt-2 border-t border-[#313244]">
          <div className="grid grid-cols-4 gap-3">
            <SettingControl
              label="Aperture"
              value={settings.aperture}
              options={['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16']}
              onChange={(v: string) => onSettingsChange({ ...settings, aperture: v })}
            />
            <SettingControl
              label="Shutter Speed"
              value={settings.shutterSpeed}
              options={['1/4000', '1/2000', '1/1000', '1/500', '1/250', '1/125', '1/60', '1/30']}
              onChange={(v: string) => onSettingsChange({ ...settings, shutterSpeed: v })}
            />
            <SettingControl
              label="ISO"
              value={settings.iso}
              options={['ISO 100', 'ISO 200', 'ISO 400', 'ISO 800', 'ISO 1600', 'ISO 3200', 'ISO 6400']}
              onChange={(v: string) => onSettingsChange({ ...settings, iso: v })}
            />
            <SettingControl
              label="White Balance"
              value={settings.whiteBalance}
              options={['Auto', 'Daylight', 'Cloudy', 'Shade', 'Tungsten', 'Fluorescent', 'Flash']}
              onChange={(v: string) => onSettingsChange({ ...settings, whiteBalance: v })}
            />
            <SettingControl
              label="Focus Mode"
              value={settings.focusMode}
              options={['AF-S', 'AF-C', 'AF-A', 'Manual']}
              onChange={(v: string) => onSettingsChange({ ...settings, focusMode: v })}
            />
            <SettingControl
              label="Drive Mode"
              value={settings.driveMode}
              options={['Single', 'Continuous L', 'Continuous H', 'Self Timer']}
              onChange={(v: string) => onSettingsChange({ ...settings, driveMode: v })}
            />
            <SettingControl
              label="Metering"
              value={settings.meteringMode}
              options={['Evaluative', 'Partial', 'Spot', 'Center-weighted']}
              onChange={(v: string) => onSettingsChange({ ...settings, meteringMode: v })}
            />
            <SettingControl
              label="Quality"
              value={settings.imageQuality}
              options={['RAW', 'RAW + JPEG Fine', 'RAW + JPEG Normal', 'JPEG Fine', 'JPEG Normal']}
              onChange={(v: string) => onSettingsChange({ ...settings, imageQuality: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SettingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-[#1e1e2e] border border-[#313244] text-center min-w-[60px]">
      <p className="text-[9px] text-[#6c7086] uppercase">{label}</p>
      <p className="text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function SettingControl({ label, value, options, onChange }: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (v: string) => void;
}) {
  const currentIndex = options.indexOf(value);
  
  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    onChange(options[newIndex]);
  };
  
  const handleNext = () => {
    const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    onChange(options[newIndex]);
  };

  return (
    <div className="bg-[#1e1e2e] rounded-lg border border-[#313244] p-2.5">
      <p className="text-[10px] text-[#6c7086] uppercase mb-1.5">{label}</p>
      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          className="w-6 h-6 rounded flex items-center justify-center text-[#6c7086] hover:text-white hover:bg-[#313244] transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="flex-1 text-center text-xs font-medium text-white truncate">{value}</span>
        <button
          onClick={handleNext}
          className="w-6 h-6 rounded flex items-center justify-center text-[#6c7086] hover:text-white hover:bg-[#313244] transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function BatteryBar({ level }: { level: number }) {
  const color = level > 50 ? 'bg-emerald-400' : level > 20 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="w-6 h-3 rounded-sm border border-[#6c7086] p-0.5 relative">
      <div className={`h-full rounded-sm ${color} transition-all`} style={{ width: `${level}%` }}></div>
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-[#6c7086] rounded-r-sm"></div>
    </div>
  );
}
