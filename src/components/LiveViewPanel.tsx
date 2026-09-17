import { useState, useEffect, useCallback, useRef } from 'react';
import { CameraDevice, CameraSettings } from '../data/cameras';
import { CCApiClient } from '../services/ccapi';

interface LiveViewPanelProps {
  camera: CameraDevice;
  settings: CameraSettings;
  onClose: () => void;
  onCapture: () => void;
  ccapiClient?: CCApiClient | null;
}

export default function LiveViewPanel({ camera, settings, onClose, onCapture, ccapiClient }: LiveViewPanelProps) {
  const [showGrid, setShowGrid] = useState(true);
  const [showFocusPoints, setShowFocusPoints] = useState(true);
  const [showHistogram, setShowHistogram] = useState(true);
  const [showLevel, setShowLevel] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusMode, setFocusMode] = useState<'single' | 'continuous' | 'manual'>('continuous');
  const [meteringMode, setMeteringMode] = useState<'evaluative' | 'partial' | 'spot'>('evaluative');
  const [activeFocusPoint, setActiveFocusPoint] = useState({ x: 50, y: 50 });
  const [captureFlash, setCaptureFlash] = useState(false);
  const [focusConfirmed, setFocusConfirmed] = useState(false);
  const [liveViewStreamUrl, setLiveViewStreamUrl] = useState<string | null>(null);
  const [streamError, setStreamError] = useState(false);
  const liveViewImgRef = useRef<HTMLImageElement>(null);

  // Initialize CCAPI live view stream
  useEffect(() => {
    if (ccapiClient) {
      const url = ccapiClient.getLiveViewStreamUrl();
      setLiveViewStreamUrl(url);
    }
  }, [ccapiClient]);

  // Handle capture with flash effect
  const handleCaptureWithFlash = async () => {
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 150);
    
    if (ccapiClient) {
      try {
        await ccapiClient.capture();
      } catch (err) {
        console.error('CCAPI capture failed:', err);
      }
    } else {
      onCapture();
    }
  };

  // Handle focus point click with confirmation
  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActiveFocusPoint({ x, y });
    setFocusConfirmed(true);
    setTimeout(() => setFocusConfirmed(false), 600);
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        handleCaptureWithFlash();
        break;
      case 'g':
      case 'G':
        setShowGrid(prev => !prev);
        break;
      case '+':
      case '=':
        setZoomLevel(prev => Math.min(10, prev + 0.5));
        break;
      case '-':
        setZoomLevel(prev => Math.max(1, prev - 0.5));
        break;
      case 'Escape':
        onClose();
        break;
      case 'h':
      case 'H':
        setShowHistogram(prev => !prev);
        break;
      case 'l':
      case 'L':
        setShowLevel(prev => !prev);
        break;
      case 'f':
      case 'F':
        setShowFocusPoints(prev => !prev);
        break;
    }
  }, [onCapture, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-40 bg-[#0f0f1a] flex flex-col">
      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#181825] border-b border-[#313244] shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm font-medium text-white">LIVE VIEW</span>
          </div>
          <div className="text-xs text-[#6c7086]">|</div>
          <div className="text-xs text-[#a6adc8]">{camera.name}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Controls */}
          <ViewToggleButton
            active={showGrid}
            onClick={() => setShowGrid(!showGrid)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
            label="Grid"
          />
          <ViewToggleButton
            active={showFocusPoints}
            onClick={() => setShowFocusPoints(!showFocusPoints)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            label="AF"
          />
          <ViewToggleButton
            active={showHistogram}
            onClick={() => setShowHistogram(!showHistogram)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            label="Hist"
          />
          <ViewToggleButton
            active={showLevel}
            onClick={() => setShowLevel(!showLevel)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            }
            label="Level"
          />
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#313244] hover:bg-[#45475a] text-white text-xs font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit Live View
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Settings */}
        <div className="w-64 bg-[#181825] border-r border-[#313244] flex flex-col overflow-y-auto">
          {/* Camera Settings */}
          <div className="p-4 border-b border-[#313244]">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Exposure</h3>
            <div className="space-y-3">
              <SettingDisplay label="Aperture" value={settings.aperture} />
              <SettingDisplay label="Shutter" value={settings.shutterSpeed} />
              <SettingDisplay label="ISO" value={settings.iso} />
              <SettingDisplay label="WB" value={settings.whiteBalance} />
            </div>
          </div>

          {/* Focus Mode */}
          <div className="p-4 border-b border-[#313244]">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Focus Mode</h3>
            <div className="space-y-1">
              {(['single', 'continuous', 'manual'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFocusMode(mode)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    focusMode === mode
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-[#a6adc8] hover:bg-[#1e1e2e] hover:text-white'
                  }`}
                >
                  {mode === 'single' ? 'AF-S (Single)' : mode === 'continuous' ? 'AF-C (Continuous)' : 'Manual Focus'}
                </button>
              ))}
            </div>
          </div>

          {/* Metering Mode */}
          <div className="p-4 border-b border-[#313244]">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Metering</h3>
            <div className="grid grid-cols-3 gap-2">
              <MeteringButton
                active={meteringMode === 'evaluative'}
                onClick={() => setMeteringMode('evaluative')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                  </svg>
                }
                label="Eval"
              />
              <MeteringButton
                active={meteringMode === 'partial'}
                onClick={() => setMeteringMode('partial')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                }
                label="Partial"
              />
              <MeteringButton
                active={meteringMode === 'spot'}
                onClick={() => setMeteringMode('spot')}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                }
                label="Spot"
              />
            </div>
          </div>

          {/* Camera Info */}
          <div className="p-4 mt-auto">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Camera</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Battery</span>
                <span className="text-white">{camera.batteryLevel}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Shots Left</span>
                <span className="text-white">{camera.shotsRemaining}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Storage</span>
                <span className="text-white">{camera.storageUsed.toFixed(1)}/{camera.storageTotal} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Live View Preview */}
        <div className="flex-1 flex flex-col bg-black relative">
          {/* Preview Area */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Simulated camera view */}
            <div 
              className="relative w-full h-full overflow-hidden"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={handlePreviewClick}
            >
              {/* Capture flash overlay */}
              {captureFlash && (
                <div className="absolute inset-0 bg-white/80 z-30 pointer-events-none"></div>
              )}

              {/* Vignette effect */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
              }}></div>
              {/* CCAPI Live View Stream */}
              {liveViewStreamUrl && !streamError && (
                <img
                  ref={liveViewImgRef}
                  src={liveViewStreamUrl}
                  alt="Live View"
                  className="absolute inset-0 w-full h-full object-contain"
                  onError={() => setStreamError(true)}
                  crossOrigin="anonymous"
                />
              )}

              {/* Simulated scene - landscape with depth (fallback when no stream) */}
              <div className={`absolute inset-0 ${liveViewStreamUrl && !streamError ? 'opacity-0' : 'opacity-100'}`}>
                {/* Sky gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700"></div>
                
                {/* Sun/light source */}
                <div className="absolute top-[20%] right-[25%] w-24 h-24 rounded-full bg-amber-200/30 blur-2xl"></div>
                <div className="absolute top-[22%] right-[27%] w-12 h-12 rounded-full bg-amber-100/40 blur-lg"></div>
                
                {/* Distant mountains */}
                <svg className="absolute bottom-[40%] left-0 right-0 w-full h-[30%]" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <path d="M0,300 L0,200 Q100,150 200,180 Q300,120 400,160 Q500,100 600,140 Q700,80 800,130 Q900,100 1000,150 L1000,300 Z" fill="rgba(100,116,139,0.6)" />
                </svg>
                
                {/* Mid-ground hills */}
                <svg className="absolute bottom-[25%] left-0 right-0 w-full h-[25%]" viewBox="0 0 1000 250" preserveAspectRatio="none">
                  <path d="M0,250 L0,150 Q150,100 300,130 Q450,80 600,120 Q750,90 900,110 L1000,140 L1000,250 Z" fill="rgba(71,85,105,0.7)" />
                </svg>
                
                {/* Foreground */}
                <svg className="absolute bottom-0 left-0 right-0 w-full h-[30%]" viewBox="0 0 1000 300" preserveAspectRatio="none">
                  <path d="M0,300 L0,100 Q200,60 400,80 Q600,50 800,70 Q900,60 1000,80 L1000,300 Z" fill="rgba(30,41,59,0.8)" />
                </svg>

                {/* Trees silhouettes */}
                <svg className="absolute bottom-[20%] left-[10%] w-16 h-24 opacity-60" viewBox="0 0 60 100">
                  <path d="M30,100 L30,50 L15,50 L30,20 L45,50 L30,50" fill="rgba(15,23,42,0.8)" />
                </svg>
                <svg className="absolute bottom-[22%] left-[15%] w-12 h-20 opacity-50" viewBox="0 0 60 100">
                  <path d="M30,100 L30,55 L18,55 L30,25 L42,55 L30,55" fill="rgba(15,23,42,0.7)" />
                </svg>
                <svg className="absolute bottom-[18%] right-[20%] w-14 h-22 opacity-55" viewBox="0 0 60 100">
                  <path d="M30,100 L30,48 L16,48 L30,18 L44,48 L30,48" fill="rgba(15,23,42,0.75)" />
                </svg>

                {/* Subtle grain/noise overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}></div>
              </div>

              {/* Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20"></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Points */}
              {showFocusPoints && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Active focus point with focus confirmation animation */}
                  <div
                    className="absolute transition-all duration-200"
                    style={{
                      left: `${activeFocusPoint.x}%`,
                      top: `${activeFocusPoint.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="w-14 h-14 border-2 border-red-500 rounded-sm relative">
                      {/* Corner brackets */}
                      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
                      <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-red-500"></div>
                      {/* Focus confirmed indicator */}
                      <div className="absolute inset-0 bg-red-500/10 animate-pulse rounded-sm"></div>
                    </div>
                    {/* Focus distance label */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-red-400 bg-black/60 px-1 rounded whitespace-nowrap">
                      2.4m
                    </div>

                    {/* Focus confirmed indicator */}
                    {focusConfirmed && (
                      <div className="absolute inset-0 border-2 border-emerald-400 rounded-sm animate-ping"></div>
                    )}
                  </div>

                  {/* Other AF points */}
                  {[
                    { x: 25, y: 33 }, { x: 50, y: 33 }, { x: 75, y: 33 },
                    { x: 25, y: 50 }, { x: 75, y: 50 },
                    { x: 25, y: 66 }, { x: 50, y: 66 }, { x: 75, y: 66 },
                  ].map((point, i) => (
                    <div
                      key={i}
                      className="absolute w-5 h-5 border border-white/30 rounded-sm"
                      style={{
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    ></div>
                  ))}

                  {/* Focus peaking highlights (simulated) */}
                  <div className="absolute top-[45%] left-[30%] w-20 h-8 border border-red-500/40 rounded-sm"></div>
                  <div className="absolute top-[55%] left-[55%] w-16 h-6 border border-red-500/30 rounded-sm"></div>
                  <div className="absolute top-[35%] right-[25%] w-12 h-10 border border-red-500/35 rounded-sm"></div>
                </div>
              )}

              {/* Level Indicator */}
              {showLevel && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="w-48 h-1 bg-black/50 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/50"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded">0.0°</span>
                </div>
              )}
            </div>

            {/* Exposure Meter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-xs text-white">-3</span>
              <div className="w-48 h-2 bg-slate-700 rounded-full relative">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-[33%] w-px bg-white/30"></div>
                <div className="absolute top-0 bottom-0 left-[66%] w-px bg-white/30"></div>
                <div className="absolute top-1/2 left-[45%] -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
              </div>
              <span className="text-xs text-white">+3</span>
              <span className="text-xs text-emerald-400 ml-2">0.0 EV</span>
            </div>

            {/* Top-left info overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[10px] text-white font-mono">LIVE</span>
              </div>
              {ccapiClient && (
                <div className={`flex items-center gap-1.5 backdrop-blur-sm rounded px-2 py-1 ${
                  liveViewStreamUrl && !streamError ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    liveViewStreamUrl && !streamError ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}></div>
                  <span className={`text-[10px] font-mono ${
                    liveViewStreamUrl && !streamError ? 'text-emerald-300' : 'text-amber-300'
                  }`}>
                    {liveViewStreamUrl && !streamError ? 'CCAPI Stream' : 'Simulated'}
                  </span>
                </div>
              )}
              <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-[10px] text-white font-mono">00:12:34</span>
              </div>
            </div>

            {/* Top-right info overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
              {ccapiClient && (
                <div className="flex items-center gap-1.5 bg-red-500/20 backdrop-blur-sm rounded px-2 py-1">
                  <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  <span className="text-[10px] text-red-300 font-mono font-bold">CCAPI</span>
                </div>
              )}
              <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-[10px] text-white font-mono">{settings.imageQuality}</span>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-[10px] text-emerald-400 font-mono">● REC READY</span>
              </div>
            </div>

            {/* Keyboard shortcuts hint */}
            <div className="absolute bottom-14 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
              <span className="text-[9px] text-white/60">SPACE</span>
              <span className="text-[9px] text-white/40">Capture</span>
              <span className="text-[9px] text-white/40">|</span>
              <span className="text-[9px] text-white/60">G</span>
              <span className="text-[9px] text-white/40">Grid</span>
              <span className="text-[9px] text-white/40">|</span>
              <span className="text-[9px] text-white/60">+/-</span>
              <span className="text-[9px] text-white/40">Zoom</span>
              <span className="text-[9px] text-white/40">|</span>
              <span className="text-[9px] text-white/60">ESC</span>
              <span className="text-[9px] text-white/40">Exit</span>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="h-20 bg-[#181825] border-t border-[#313244] flex items-center justify-center gap-6 px-6">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                disabled={zoomLevel <= 1}
                className="w-8 h-8 rounded-lg bg-[#313244] hover:bg-[#45475a] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm text-white font-medium min-w-[3rem] text-center">{zoomLevel}x</span>
              <button
                onClick={() => setZoomLevel(Math.min(10, zoomLevel + 0.5))}
                disabled={zoomLevel >= 10}
                className="w-8 h-8 rounded-lg bg-[#313244] hover:bg-[#45475a] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Capture Button */}
            <button
              onClick={handleCaptureWithFlash}
              className="relative group"
            >
              <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center group-hover:border-white/60 transition-colors">
                <div className="w-11 h-11 rounded-full bg-white group-hover:bg-red-400 group-active:scale-90 transition-all"></div>
              </div>
            </button>

            {/* Quick Settings */}
            <div className="flex items-center gap-3">
              <QuickSettingButton label="AF" value={focusMode === 'single' ? 'AF-S' : focusMode === 'continuous' ? 'AF-C' : 'MF'} />
              <QuickSettingButton label="Drive" value="Single" />
              <QuickSettingButton label="WB" value={settings.whiteBalance} />
            </div>
          </div>
        </div>

        {/* Right Panel - Histogram & Info */}
        <div className="w-64 bg-[#181825] border-l border-[#313244] flex flex-col overflow-y-auto">
          {/* Histogram */}
          {showHistogram && (
            <div className="p-4 border-b border-[#313244]">
              <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Histogram</h3>
              <div className="bg-black rounded-lg p-3">
                <Histogram />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-[#6c7086]">
                <span>Shadows</span>
                <span>Midtones</span>
                <span>Highlights</span>
              </div>
            </div>
          )}

          {/* RGB Histogram */}
          {showHistogram && (
            <div className="p-4 border-b border-[#313244]">
              <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">RGB Channels</h3>
              <div className="bg-black rounded-lg p-3">
                <RGBHistogram />
              </div>
            </div>
          )}

          {/* Focus Info */}
          <div className="p-4 border-b border-[#313244]">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Focus</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Mode</span>
                <span className="text-white">{focusMode === 'single' ? 'AF-S' : focusMode === 'continuous' ? 'AF-C' : 'Manual'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Point</span>
                <span className="text-white">Center</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Status</span>
                <span className="text-emerald-400">Focused</span>
              </div>
            </div>
          </div>

          {/* Exposure Info */}
          <div className="p-4 border-b border-[#313244]">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Exposure</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Metering</span>
                <span className="text-white capitalize">{meteringMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Exposure</span>
                <span className="text-white">0.0 EV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Brightness</span>
                <span className="text-white">Normal</span>
              </div>
            </div>
          </div>

          {/* Shooting Info */}
          <div className="p-4">
            <h3 className="text-xs font-semibold text-[#6c7086] uppercase tracking-wider mb-3">Shooting</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Quality</span>
                <span className="text-white">{settings.imageQuality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Drive</span>
                <span className="text-white">{settings.driveMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6c7086]">Timer</span>
                <span className="text-white">Off</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewToggleButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-violet-500/15 text-violet-300'
          : 'bg-[#313244] text-[#6c7086] hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#6c7086]">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function MeteringButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
        active
          ? 'bg-violet-500/15 text-violet-300'
          : 'bg-[#313244] text-[#6c7086] hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

function QuickSettingButton({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg bg-[#313244]">
      <span className="text-[10px] text-[#6c7086]">{label}</span>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}

function Histogram() {
  // Generate a simple histogram shape
  const bars = Array.from({ length: 32 }, (_, i) => {
    const center = 16;
    const distance = Math.abs(i - center);
    const height = Math.max(10, 100 - distance * 3 + Math.random() * 20);
    return height;
  });

  return (
    <div className="flex items-end gap-px h-16">
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 bg-gradient-to-t from-white/60 to-white/30 rounded-t-sm"
          style={{ height: `${height}%` }}
        ></div>
      ))}
    </div>
  );
}

function RGBHistogram() {
  const generateChannel = (offset: number) => {
    return Array.from({ length: 32 }, (_, i) => {
      const center = 16 + offset;
      const distance = Math.abs(i - center);
      return Math.max(5, 80 - distance * 2.5 + Math.random() * 15);
    });
  };

  const red = generateChannel(-2);
  const green = generateChannel(0);
  const blue = generateChannel(2);

  return (
    <div className="relative h-16">
      {/* Red channel */}
      <div className="absolute inset-0 flex items-end gap-px opacity-60">
        {red.map((height, i) => (
          <div
            key={`r-${i}`}
            className="flex-1 bg-red-500 rounded-t-sm"
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
      {/* Green channel */}
      <div className="absolute inset-0 flex items-end gap-px opacity-60">
        {green.map((height, i) => (
          <div
            key={`g-${i}`}
            className="flex-1 bg-green-500 rounded-t-sm"
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
      {/* Blue channel */}
      <div className="absolute inset-0 flex items-end gap-px opacity-60">
        {blue.map((height, i) => (
          <div
            key={`b-${i}`}
            className="flex-1 bg-blue-500 rounded-t-sm"
            style={{ height: `${height}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}
