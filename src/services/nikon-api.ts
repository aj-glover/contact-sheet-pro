/**
 * Nikon Camera Control API Client
 * 
 * Nikon does not have an official HTTP REST API like Canon's CCAPI.
 * This client supports:
 * 1. Nikon Wireless Transmitter Utility (WTU) HTTP interface
 * 2. Direct WiFi control for Z-series cameras (Z8, Z9, Zf, Z6III, Z7II)
 * 3. USB tethering via Nikon SDK (requires native bridge)
 * 
 * Reference: Nikon SDK documentation, community reverse-engineering
 */

export interface NikonAPIConfig {
  /** Camera IP address (for WiFi control) */
  ipAddress: string;
  /** Port (default: 80 for WTU, varies for direct WiFi) */
  port: number;
  /** Connection type */
  connectionType: 'wtu' | 'wifi-direct' | 'usb-bridge';
}

export interface NikonDeviceInfo {
  modelName: string;
  firmwareVersion: string;
  serialNumber: string;
}

export interface NikonBatteryInfo {
  level: number; // 0-100
  status: 'normal' | 'low' | 'charging';
}

export interface NikonStorageInfo {
  slot1: {
    inserted: boolean;
    cardType?: string;
    freeSpace?: number; // MB
    fileCount?: number;
  };
  slot2?: {
    inserted: boolean;
    cardType?: string;
    freeSpace?: number;
    fileCount?: number;
  };
}

export interface NikonSettings {
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  whiteBalance?: string;
  exposureCompensation?: string;
  focusMode?: string;
  afAreaMode?: string;
  meteringMode?: string;
  imageQuality?: string;
  imageSize?: string;
  driveMode?: string;
  colorSpace?: string;
  activeDLighting?: string;
}

export class NikonApiClient {
  private baseUrl: string;
  private connected: boolean = false;
  private config: NikonAPIConfig;

  constructor(config: NikonAPIConfig) {
    this.config = config;
    this.baseUrl = `http://${config.ipAddress}:${config.port}`;
  }

  async ping(): Promise<boolean> {
    try {
      // Nikon cameras respond to a simple GET on the root
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      this.connected = response.ok || response.status === 403; // 403 means camera is there
      return this.connected;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // ============================================
  // Device Information
  // ============================================

  async getDeviceInfo(): Promise<NikonDeviceInfo> {
    const response = await fetch(`${this.baseUrl}/info`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get device info: ${response.status}`);
    return response.json();
  }

  async getBattery(): Promise<NikonBatteryInfo> {
    const response = await fetch(`${this.baseUrl}/devicestatus/battery`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get battery: ${response.status}`);
    return response.json();
  }

  async getStorage(): Promise<NikonStorageInfo> {
    const response = await fetch(`${this.baseUrl}/devicestatus/storage`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get storage: ${response.status}`);
    return response.json();
  }

  // ============================================
  // Shooting Settings
  // ============================================

  async getAllSettings(): Promise<NikonSettings> {
    const response = await fetch(`${this.baseUrl}/shooting/settings`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get settings: ${response.status}`);
    return response.json();
  }

  async getAperture(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/aperture`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get aperture: ${response.status}`);
    return response.json();
  }

  async setAperture(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/aperture`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set aperture: ${response.status}`);
  }

  async getShutterSpeed(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/shutterspeed`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get shutter speed: ${response.status}`);
    return response.json();
  }

  async setShutterSpeed(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/shutterspeed`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set shutter speed: ${response.status}`);
  }

  async getISO(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/iso`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get ISO: ${response.status}`);
    return response.json();
  }

  async setISO(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/iso`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set ISO: ${response.status}`);
  }

  async getWhiteBalance(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/whitebalance`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get white balance: ${response.status}`);
    return response.json();
  }

  async setWhiteBalance(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/whitebalance`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set white balance: ${response.status}`);
  }

  async getExposureCompensation(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/exposurecompensation`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get exposure compensation: ${response.status}`);
    return response.json();
  }

  async setExposureCompensation(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/exposurecompensation`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set exposure compensation: ${response.status}`);
  }

  async getFocusMode(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/focusmode`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get focus mode: ${response.status}`);
    return response.json();
  }

  async setFocusMode(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/focusmode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set focus mode: ${response.status}`);
  }

  async getAFAreaMode(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/afareamode`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get AF area mode: ${response.status}`);
    return response.json();
  }

  async setAFAreaMode(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/afareamode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set AF area mode: ${response.status}`);
  }

  async getMeteringMode(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/meteringmode`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get metering mode: ${response.status}`);
    return response.json();
  }

  async setMeteringMode(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/meteringmode`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set metering mode: ${response.status}`);
  }

  async getImageQuality(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/imagequality`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get image quality: ${response.status}`);
    return response.json();
  }

  async setImageQuality(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/imagequality`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set image quality: ${response.status}`);
  }

  // ============================================
  // Shooting Control
  // ============================================

  async capture(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Failed to capture: ${response.status}`);
  }

  async autoFocus(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/af`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to autofocus: ${response.status}`);
  }

  async startMovieRecording(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/movie/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to start recording: ${response.status}`);
  }

  async stopMovieRecording(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/movie/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to stop recording: ${response.status}`);
  }

  // ============================================
  // Live View
  // ============================================

  async startLiveView(): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to start live view: ${response.status}`);
    return response.json();
  }

  async stopLiveView(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: false }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to stop live view: ${response.status}`);
  }

  getLiveViewStreamUrl(): string {
    return `${this.baseUrl}/shooting/liveview/stream`;
  }

  // ============================================
  // Contents
  // ============================================

  async getContents(): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/contents`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get contents: ${response.status}`);
    return response.json();
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopLiveView();
    } catch {
      // Ignore
    }
    this.connected = false;
  }
}

export function createNikonApiClient(config: NikonAPIConfig): NikonApiClient {
  return new NikonApiClient(config);
}
