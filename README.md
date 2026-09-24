# Contact Sheet Pro

## 📋 Overview

Contact Sheet Pro is a professional photography workflow application designed to streamline tethered shooting, live view monitoring, and image organization. It supports multi-camera setups and provides smart contact sheet generation for efficient post-production management.

## ✨ Key Features

- Smart Contact Sheets: Automated grid generation for quick review.
- Multi-Camera Support: Connect and manage multiple cameras simultaneously.
- Live View & Tethered Shooting: Real-time preview and direct capture to computer.
- Image Organization: Grid view, filtering, and detailed metadata panels.
- Broad Compatibility: Supports Canon, Sony, Nikon, and Fujifilm models.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Modern web browser
- Compatible camera

### Installation

```bash
npm install
```

### Build Commands

- Development: `npm run dev`
- Production Build: `npm run build`
- Preview Production: `npm run preview`

## 📖 Usage Guide

### Connecting Cameras

1. Launch the app in your browser.
2. Navigate to Settings > Camera Connection.
3. Select your camera model from the supported list.
4. Follow the on-screen prompts to establish connection via USB or Wi-Fi.

### Tethered Shooting & Live View

- Use SPACE to start/stop live view.
- Press G to toggle grid overlay.
- Capture images using the shutter button or keyboard shortcut.

### Image Management

- Switch between Grid View and List View.
- Filter images by date, camera, or rating.
- Click any thumbnail to open the Detail Panel for EXIF data and editing options.

## 📷 Camera Compatibility

| Manufacturer | Supported Models | Requirements |
| --- | --- | --- |
| Canon | EOS R5, R6, 90D, 5D Mark IV | Latest firmware, USB tethering enabled |
| Sony | A7IV, A7III, A6600 | Remote control mode active |
| Nikon | Z6 II, Z7 II, D850 | USB connection, no card required |
| Fujifilm | X-T5, X-H2S, GFX 100S | Fuji X Raw Studio compatibility |

*Note: Check individual model pages for specific firmware requirements.*

## 🏗️ Architecture

### Tech Stack

- Frontend: React 18, TypeScript 5
- Build Tool: Vite 6
- Styling: Tailwind CSS 4

### Service Layer

The app uses dedicated API clients for different camera manufacturers, abstracting protocol differences into a unified interface.

### Data Flow

1. Camera sends raw/JPEG data via tethered connection.
2. Service layer processes and stores images locally.
3. UI components reactively update grids and previews.

## ⌨️ Keyboard Shortcuts

### Live View Controls

- SPACE: Toggle live view
- G: Toggle grid
- H: Hide/show HUD
- L: Lock focus/exposure
- F: Fullscreen mode
- +/-: Zoom in/out
- ESC: Exit live view

### General

- Ctrl+A: Select all images
- Shift+Click: Multi-select
- Delete: Remove selected images

## 🔧 Troubleshooting

### Camera Not Detected

- Ensure USB cable is connected directly (no hubs).
- Verify camera is set to Mass Storage or Tethering mode.
- Restart the app and re-plug the camera.

### Live View Lag or Freeze

- Close other applications using the camera.
- Reduce image quality settings in camera menu.
- Check network stability if using Wi-Fi tethering.

### Import Failures

- Confirm sufficient disk space.
- Try importing in smaller batches.
- Check file permissions on destination folder.

## 🤝 Contributing & Support

### Contribution Guidelines

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes with clear messages.
4. Push to branch and open a Pull Request.

### Development Standards

- Follow ESLint rules.
- Write tests for new features.
- Document public APIs.

### Support Channels

- GitHub Issues: For bugs and feature requests.
- GitHub Discussions: For questions and community support.
- Email: support@contactsheetpro.com

## 🗺️ Roadmap

### Planned Features

- Bulk download functionality
- Focus stacking tools
- Intervalometer for time-lapse
- Cloud backup integration

### Future Camera Support

- Phase One
- Leica
- Panasonic
- Olympus
- Hasselblad
