/**
 * Unified Camera API Service
 * 
 * Provides a single interface for controlling cameras from
 * Canon, Sony, Nikon, and Fujifilm via their respective APIs.
 */

import { CCApiClient, CCAPIConfig } from './ccapi';
import { SonyApiClient, SonyAPIConfig } from './sony-api';
import { NikonApiClient, NikonAPIConfig } from './nikon-api';
import { FujifilmApiClient, FujifilmAPIConfig } from './fujifilm-api';

export type CameraManufacturer = 'canon' | 'sony' | 'nikon' | 'fujifilm';

export interface UnifiedCameraConfig {
  manufacturer: CameraManufacturer;
  ipAddress: string;
  port: number;
  // Manufacturer-specific options
  sonyMode?: 'legacy' | 'rest';
  sonyServerUrl?: string;
  nikonConnectionType?: 'wtu' | 'wifi-direct' | 'usb-bridge';
  fujifilmConnectionType?: 'wifi' | 'usb';
}

export interface UnifiedCameraInfo {
  manufacturer: CameraManufacturer;
  modelName: string;
  firmwareVersion: string;
  serialNumber: string;
  batteryLevel: number;
  storageUsed?: number;
  storageTotal?: number;
  shotsRemaining?: number;
}

export interface UnifiedSettings {
  aperture: string;
  shutterSpeed: string;
  iso: string;
  whiteBalance: string;
  exposureCompensation?: string;
  focusMode: string;
  driveMode: string;
  meteringMode: string;
  imageQuality: string;
  // Manufacturer-specific
  filmSimulation?: string; // Fujifilm
  afAreaMode?: string; // Nikon
  dynamicRange?: string; // Fujifilm
  colorSpace?: string;
  pictureStyle?: string; // Canon
}

export class UnifiedCameraClient {
  private client: CCApiClient | SonyApiClient | NikonApiClient | FujifilmApiClient;
  private manufacturer: CameraManufacturer;
  private config: UnifiedCameraConfig;

  constructor(config: UnifiedCameraConfig) {
    this.config = config;
    this.manufacturer = config.manufacturer;

    switch (config.manufacturer) {
      case 'canon':
        this.client = new CCApiClient({
          ipAddress: config.ipAddress,
          port: config.port,
        } as CCAPIConfig);
        break;
      case 'sony':
        this.client = new SonyApiClient({
          ipAddress: config.ipAddress,
          port: config.port,
          mode: config.sonyMode || 'rest',
          serverUrl: config.sonyServerUrl,
        } as SonyAPIConfig);
        break;
      case 'nikon':
        this.client = new NikonApiClient({
          ipAddress: config.ipAddress,
          port: config.port,
          connectionType: config.nikonConnectionType || 'wifi-direct',
        } as NikonAPIConfig);
        break;
      case 'fujifilm':
        this.client = new FujifilmApiClient({
          ipAddress: config.ipAddress,
          port: config.port,
          connectionType: config.fujifilmConnectionType || 'wifi',
        } as FujifilmAPIConfig);
        break;
    }
  }

  getManufacturer(): CameraManufacturer {
    return this.manufacturer;
  }

  getRawClient(): CCApiClient | SonyApiClient | NikonApiClient | FujifilmApiClient {
    return this.client;
  }

  async ping(): Promise<boolean> {
    return this.client.ping();
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  // ============================================
  // Device Info
  // ============================================

  async getCameraInfo(): Promise<UnifiedCameraInfo> {
    try {
      switch (this.manufacturer) {
        case 'canon': {
          const c = this.client as CCApiClient;
          const [info, battery] = await Promise.all([
            c.getDeviceInfo(),
            c.getBattery().catch(() => null),
          ]);
          return {
            manufacturer: 'canon',
            modelName: info.productname || 'Canon Camera',
            firmwareVersion: info.firmwareversion || 'Unknown',
            serialNumber: info.uniqueid || 'Unknown',
            batteryLevel: battery?.level ?? 100,
          };
        }
        case 'sony': {
          // Sony REST API doesn't have a direct info endpoint
          return {
            manufacturer: 'sony',
            modelName: 'Sony Camera',
            firmwareVersion: 'Unknown',
            serialNumber: 'Unknown',
            batteryLevel: 100,
          };
        }
        case 'nikon': {
          const c = this.client as NikonApiClient;
          const [info, battery] = await Promise.all([
            c.getDeviceInfo(),
            c.getBattery().catch(() => null),
          ]);
          return {
            manufacturer: 'nikon',
            modelName: info.modelName || 'Nikon Camera',
            firmwareVersion: info.firmwareVersion || 'Unknown',
            serialNumber: info.serialNumber || 'Unknown',
            batteryLevel: battery?.level ?? 100,
          };
        }
        case 'fujifilm': {
          const c = this.client as FujifilmApiClient;
          const [info, battery] = await Promise.all([
            c.getDeviceInfo(),
            c.getBattery().catch(() => null),
          ]);
          return {
            manufacturer: 'fujifilm',
            modelName: info.modelName || 'Fujifilm Camera',
            firmwareVersion: info.firmwareVersion || 'Unknown',
            serialNumber: info.serialNumber || 'Unknown',
            batteryLevel: battery?.level ?? 100,
          };
        }
      }
    } catch (err) {
      console.error('Failed to get camera info:', err);
      return {
        manufacturer: this.manufacturer,
        modelName: `${this.getManufacturerName()} Camera`,
        firmwareVersion: 'Unknown',
        serialNumber: 'Unknown',
        batteryLevel: 0,
      };
    }
  }

  // ============================================
  // Settings
  // ============================================

  async getSettings(): Promise<UnifiedSettings> {
    const defaults: UnifiedSettings = {
      aperture: 'f/2.8',
      shutterSpeed: '1/250',
      iso: 'ISO 400',
      whiteBalance: 'Auto',
      focusMode: 'AF-C',
      driveMode: 'Single',
      meteringMode: 'Evaluative',
      imageQuality: 'RAW',
    };

    try {
      switch (this.manufacturer) {
        case 'canon': {
          const c = this.client as CCApiClient;
          const settings = await c.getAllSettings();
          return {
            aperture: settings.av?.currentDisplay || settings.av?.value || defaults.aperture,
            shutterSpeed: settings.tv?.currentDisplay || settings.tv?.value || defaults.shutterSpeed,
            iso: settings.iso?.currentDisplay || settings.iso?.value || defaults.iso,
            whiteBalance: settings.wb?.currentDisplay || settings.wb?.value || defaults.whiteBalance,
            focusMode: settings.afmethod?.currentDisplay || settings.afmethod?.value || defaults.focusMode,
            driveMode: settings.drive?.currentDisplay || settings.drive?.value || defaults.driveMode,
            meteringMode: settings.metering?.currentDisplay || settings.metering?.value || defaults.meteringMode,
            imageQuality: settings.stillimagequality?.currentDisplay || settings.stillimagequality?.value || defaults.imageQuality,
            exposureCompensation: settings.exposure?.currentDisplay || settings.exposure?.value,
            colorSpace: settings.colorspace?.value,
            pictureStyle: settings.picturestyle?.value,
          };
        }
        case 'sony': {
          const c = this.client as SonyApiClient;
          const [iso, aperture, shutter, wb] = await Promise.all([
            c.getISO().catch(() => null),
            c.getAperture().catch(() => null),
            c.getShutterSpeed().catch(() => null),
            c.getWhiteBalance().catch(() => null),
          ]);
          return {
            aperture: (aperture as any)?.current || defaults.aperture,
            shutterSpeed: (shutter as any)?.current || defaults.shutterSpeed,
            iso: (iso as any)?.current || defaults.iso,
            whiteBalance: (wb as any)?.current || defaults.whiteBalance,
            focusMode: defaults.focusMode,
            driveMode: defaults.driveMode,
            meteringMode: defaults.meteringMode,
            imageQuality: defaults.imageQuality,
          };
        }
        case 'nikon': {
          const c = this.client as NikonApiClient;
          const [aperture, shutter, iso, wb] = await Promise.all([
            c.getAperture().catch(() => null),
            c.getShutterSpeed().catch(() => null),
            c.getISO().catch(() => null),
            c.getWhiteBalance().catch(() => null),
          ]);
          return {
            aperture: (aperture as any)?.value || defaults.aperture,
            shutterSpeed: (shutter as any)?.value || defaults.shutterSpeed,
            iso: (iso as any)?.value || defaults.iso,
            whiteBalance: (wb as any)?.value || defaults.whiteBalance,
            focusMode: defaults.focusMode,
            driveMode: defaults.driveMode,
            meteringMode: defaults.meteringMode,
            imageQuality: defaults.imageQuality,
          };
        }
        case 'fujifilm': {
          const c = this.client as FujifilmApiClient;
          const [aperture, shutter, iso, wb, film] = await Promise.all([
            c.getAperture().catch(() => null),
            c.getShutterSpeed().catch(() => null),
            c.getISO().catch(() => null),
            c.getWhiteBalance().catch(() => null),
            c.getFilmSimulation().catch(() => null),
          ]);
          return {
            aperture: (aperture as any)?.value || defaults.aperture,
            shutterSpeed: (shutter as any)?.value || defaults.shutterSpeed,
            iso: (iso as any)?.value || defaults.iso,
            whiteBalance: (wb as any)?.value || defaults.whiteBalance,
            focusMode: defaults.focusMode,
            driveMode: defaults.driveMode,
            meteringMode: defaults.meteringMode,
            imageQuality: defaults.imageQuality,
            filmSimulation: (film as any)?.value,
          };
        }
      }
    } catch (err) {
      console.error('Failed to get settings:', err);
      return defaults;
    }
  }

  async setAperture(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setAperture(value); break;
      case 'sony': await (this.client as SonyApiClient).setAperture(value); break;
      case 'nikon': await (this.client as NikonApiClient).setAperture(value); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).setAperture(value); break;
    }
  }

  async setShutterSpeed(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setShutterSpeed(value); break;
      case 'sony': await (this.client as SonyApiClient).setShutterSpeed(value); break;
      case 'nikon': await (this.client as NikonApiClient).setShutterSpeed(value); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).setShutterSpeed(value); break;
    }
  }

  async setISO(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setISO(value); break;
      case 'sony': await (this.client as SonyApiClient).setISO(value); break;
      case 'nikon': await (this.client as NikonApiClient).setISO(value); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).setISO(value); break;
    }
  }

  async setWhiteBalance(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setWhiteBalance(value); break;
      case 'sony': await (this.client as SonyApiClient).setWhiteBalance(value); break;
      case 'nikon': await (this.client as NikonApiClient).setWhiteBalance(value); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).setWhiteBalance(value); break;
    }
  }

  async setMeteringMode(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setMetering(value); break;
      case 'sony': await (this.client as SonyApiClient).setMeteringMode(value); break;
      case 'nikon': await (this.client as NikonApiClient).setMeteringMode(value); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).setMeteringMode(value); break;
    }
  }

  async setDriveMode(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setDriveMode(value); break;
      case 'sony': await (this.client as SonyApiClient).setDriveMode(value); break;
      case 'nikon': break; // Nikon doesn't have a direct drive mode endpoint
      case 'fujifilm': break; // Fujifilm doesn't have a direct drive mode endpoint
    }
  }

  async setImageQuality(value: string): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).setImageQuality(value); break;
      case 'sony': await (this.client as SonyApiClient).setImageQuality(value); break;
      case 'nikon': await (this.client as NikonApiClient).setImageQuality(value); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).setImageQuality(value); break;
    }
  }

  // ============================================
  // Shooting Control
  // ============================================

  async capture(): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).capture(); break;
      case 'sony': await (this.client as SonyApiClient).capture(); break;
      case 'nikon': await (this.client as NikonApiClient).capture(); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).capture(); break;
    }
  }

  async autoFocus(): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).performAF(); break;
      case 'sony': await (this.client as SonyApiClient).autoFocus(); break;
      case 'nikon': await (this.client as NikonApiClient).autoFocus(); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).autoFocus(); break;
    }
  }

  // ============================================
  // Live View
  // ============================================

  async startLiveView(): Promise<string> {
    switch (this.manufacturer) {
      case 'canon': {
        const info = await (this.client as CCApiClient).startLiveView();
        return info.url || (this.client as CCApiClient).getLiveViewStreamUrl();
      }
      case 'sony': return (this.client as SonyApiClient).startLiveView();
      case 'nikon': {
        const info = await (this.client as NikonApiClient).startLiveView();
        return info.url || (this.client as NikonApiClient).getLiveViewStreamUrl();
      }
      case 'fujifilm': {
        const info = await (this.client as FujifilmApiClient).startLiveView();
        return info.url || (this.client as FujifilmApiClient).getLiveViewStreamUrl();
      }
    }
  }

  async stopLiveView(): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).stopLiveView(); break;
      case 'sony': await (this.client as SonyApiClient).stopLiveView(); break;
      case 'nikon': await (this.client as NikonApiClient).stopLiveView(); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).stopLiveView(); break;
    }
  }

  // ============================================
  // Disconnect
  // ============================================

  async disconnect(): Promise<void> {
    switch (this.manufacturer) {
      case 'canon': await (this.client as CCApiClient).disconnect(); break;
      case 'sony': await (this.client as SonyApiClient).disconnect(); break;
      case 'nikon': await (this.client as NikonApiClient).disconnect(); break;
      case 'fujifilm': await (this.client as FujifilmApiClient).disconnect(); break;
    }
  }

  // ============================================
  // Helpers
  // ============================================

  getManufacturerName(): string {
    switch (this.manufacturer) {
      case 'canon': return 'Canon';
      case 'sony': return 'Sony';
      case 'nikon': return 'Nikon';
      case 'fujifilm': return 'Fujifilm';
    }
  }

  getManufacturerColor(): string {
    switch (this.manufacturer) {
      case 'canon': return 'red';
      case 'sony': return 'blue';
      case 'nikon': return 'yellow';
      case 'fujifilm': return 'green';
    }
  }
}

export function createUnifiedCameraClient(config: UnifiedCameraConfig): UnifiedCameraClient {
  return new UnifiedCameraClient(config);
}
