# Contact Sheet Pro - Multi-Manufacturer Camera API Integration

## Overview
Contact Sheet Pro now supports **four major camera manufacturers** through their respective APIs:
- **Canon** (CCAPI - Camera Control API)
- **Sony** (Camera Remote API - both legacy JSON-RPC and new Alpha REST API)
- **Nikon** (WiFi Control for Z-series cameras)
- **Fujifilm** (Camera Control SDK / XApp protocol)

## Architecture

### Service Layer (`src/services/`)

#### 1. `ccapi.ts` - Canon CCAPI Client
- Full REST API implementation for Canon cameras
- Endpoints: device info, battery, storage, lens, shooting settings, capture, live view, contents
- Reference: https://developercommunity.usa.canon.com/s/article/CCAPI-Function-List

#### 2. `sony-api.ts` - Sony Camera Remote API Client
- **Dual-mode support**:
  - **Legacy JSON-RPC** (Smart Remote Control) - for older cameras
  - **Alpha REST API** - for newer cameras via @alpha-sdk/api server
- Endpoints: ISO, aperture, shutter speed, white balance, focus mode, capture, live view
- Reference: https://developer.sony.com/develop/cameras/

#### 3. `nikon-api.ts` - Nikon WiFi Control Client
- HTTP-based control for Z-series cameras (Z8, Z9, Zf, Z6III, Z7II)
- Endpoints: device info, battery, storage, shooting settings, capture, live view
- Compatible with Wireless Transmitter Utility

#### 4. `fujifilm-api.ts` - Fujifilm Camera Control SDK Client
- WiFi and USB tethering support
- X-series (X-T5, X-H2, X-Pro3) and GFX series
- Unique features: Film Simulation, Dynamic Range, Grain Effect
- Reference: https://www.fujifilm-x.com/en-us/camera-control-sdk/

#### 5. `unified-camera.ts` - Unified Camera Client
- Single interface for all four manufacturers
- Abstracts manufacturer-specific differences
- Provides common methods: `capture()`, `setAperture()`, `startLiveView()`, etc.
- Returns unified data structures across all brands

### UI Layer (`src/components/`)

#### `UniversalConnectPanel.tsx`
- Manufacturer selection grid (Canon/Sony/Nikon/Fujifilm)
- Color-coded UI per manufacturer
- IP address and port configuration
- Saved cameras (persisted to localStorage)
- Setup instructions per manufacturer
- Connection status display with camera info

#### `ShootingPanel.tsx`
- Real-time camera settings display
- Quick setting pills (AP, SS, ISO, WB)
- Large capture button with flash effect
- Session shot counter
- Auto-import toggle
- Expandable settings panel with all controls
- CCAPI/API badge indicator

#### `LiveViewPanel.tsx`
- Full-screen live view with MJPEG stream
- Grid overlay (rule of thirds)
- Focus points with peaking
- Histogram (luminance and RGB)
- Electronic level
- Exposure meter
- Zoom controls (1x - 10x)
- Keyboard shortcuts (SPACE, G, H, L, F, +/-, ESC)
- Focus confirmation animation

## Features

### Camera Connection
- ✅ Multi-manufacturer support (Canon, Sony, Nikon, Fujifilm)
- ✅ WiFi and USB tethering
- ✅ Saved camera configurations
- ✅ Auto-discovery and connection testing
- ✅ Connection status indicators

### Shooting Control
- ✅ Remote capture with shutter sound simulation
- ✅ Real-time settings sync (aperture, shutter, ISO, WB, etc.)
- ✅ Auto-import captured images
- ✅ Session shot counter
- ✅ Battery and storage monitoring

### Live View
- ✅ Real-time MJPEG stream from camera
- ✅ Interactive focus points
- ✅ Focus peaking visualization
- ✅ Grid overlays
- ✅ Histogram display
- ✅ Electronic level
- ✅ Exposure meter
- ✅ Zoom control
- ✅ Keyboard shortcuts

### Settings Management
- ✅ Aperture (AV/F-number)
- ✅ Shutter Speed (TV)
- ✅ ISO
- ✅ White Balance
- ✅ Focus Mode (AF-S, AF-C, Manual)
- ✅ Drive Mode (Single, Continuous, Timer)
- ✅ Metering Mode (Evaluative, Spot, etc.)
- ✅ Image Quality (RAW, JPEG, etc.)
- ✅ Film Simulation (Fujifilm-specific)
- ✅ Dynamic Range (Fujifilm-specific)

## API Endpoints Summary

### Canon CCAPI
```
GET  /ccapi/ver100/deviceinformation
GET  /ccapi/ver100/devicestatus/battery
GET  /ccapi/ver100/shooting/settings
PUT  /ccapi/ver100/shooting/settings/av
POST /ccapi/ver100/shooting/control/shutterbutton
POST /ccapi/ver100/shooting/liveview
GET  /ccapi/ver100/shooting/liveview/jpeg
```

### Sony Camera Remote API (REST)
```
GET  /api/cameras
POST /api/cameras/{id}/connection
PUT  /api/cameras/{id}/properties/iso
POST /api/cameras/{id}/actions/af-shutter
POST /api/cameras/{id}/actions/liveview-start
GET  /api/cameras/{id}/liveview
```

### Nikon WiFi Control
```
GET  /info
GET  /devicestatus/battery
GET  /shooting/settings
PUT  /shooting/settings/aperture
POST /shooting/control/capture
POST /shooting/liveview
GET  /shooting/liveview/stream
```

### Fujifilm Camera Control SDK
```
POST /connect
GET  /device/info
GET  /shooting/settings
PUT  /shooting/settings/aperture
POST /shooting/control/capture
POST /shooting/liveview
GET  /shooting/liveview/stream
```

## Usage

1. Click "Connect Camera" button in the header
2. Select manufacturer (Canon/Sony/Nikon/Fujifilm)
3. Enter camera IP address and port
4. Click "Connect"
5. Camera settings are automatically fetched
6. Use "Shoot" button or "Live View" to control camera

## Technical Details

- **Language**: TypeScript
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useCallback, useEffect)
- **HTTP Client**: Fetch API with AbortController for timeouts
- **Storage**: localStorage for saved camera configurations

## Browser Compatibility

- Modern browsers with Fetch API support
- CORS must be enabled on camera API endpoints
- MJPEG streaming requires browser support for multipart images

## Future Enhancements

- [ ] Bulk image download
- [ ] Tethered shooting with preview
- [ ] Focus stacking control
- [ ] Intervalometer functionality
- [ ] GPS/location tagging
- [ ] Cloud backup integration
- [ ] Multi-camera synchronization
- [ ] Video recording control
- [ ] HDR bracketing
- [ ] Time-lapse creation
