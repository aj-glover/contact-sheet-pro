/**
 * Fujifilm Camera Control API Client
 * 
 * Fujifilm Camera Control SDK and XApp protocol support.
 * Compatible with X-Series (X-T5, X-H2, X-Pro3, etc.) and GFX series.
 * 
 * Connection methods:
 * 1. WiFi (via XApp protocol) - proprietary HTTP-based
 * 2. USB Tethering - via Camera Control SDK
 * 
 * Reference: Fujifilm Camera Control SDK documentation
 */

export interface FujifilmAPIConfig {
  /** Camera IP address (for WiFi) */
  ipAddress: string;
  /** Port (default: 5555 for XApp) */
  port: number;
  /** Connection type */
  connectionType: 'wifi' | 'usb';
}

export interface FujifilmDeviceInfo {
  modelName: string;
  serialNumber: string;
  firmwareVersion: string;
}

export interface FujifilmBatteryInfo {
  level: number;
  status: 'normal' | 'low' | 'charging';
}

export interface FujifilmStorageInfo {
  slot1: {
    inserted: boolean;
    cardType?: string;
    freeSpace?: number;
    fileCount?: number;
  };
  slot2?: {
    inserted: boolean;
    cardType?: string;
    freeSpace?: number;
    fileCount?: number;
  };
}

export interface FujifilmSettings {
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  whiteBalance?: string;
  exposureCompensation?: string;
  focusMode?: string;
  afMode?: string;
  meteringMode?: string;
  filmSimulation?: string;
  imageQuality?: string;
  imageSize?: string;
  driveMode?: string;
  colorSpace?: string;
  dynamicRange?: string;
  grainEffect?: string;
}

export class FujifilmApiClient {
  private baseUrl: string;
  private connected: boolean = false;
  private config: FujifilmAPIConfig;
  private sessionId: string | null = null;

  constructor(config: FujifilmAPIConfig) {
    this.config = config;
    this.baseUrl = `http://${config.ipAddress}:${config.port}`;
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: 'ContactSheetPro' }),
        signal: AbortSignal.timeout(3000),
      });
      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.sessionId || null;
        this.connected = true;
        return true;
      }
      return false;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.sessionId) {
      headers['X-Session-ID'] = this.sessionId;
    }
    return headers;
  }

  // ============================================
  // Device Information
  // ============================================

  async getDeviceInfo(): Promise<FujifilmDeviceInfo> {
    const response = await fetch(`${this.baseUrl}/device/info`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get device info: ${response.status}`);
    return response.json();
  }

  async getBattery(): Promise<FujifilmBatteryInfo> {
    const response = await fetch(`${this.baseUrl}/device/battery`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get battery: ${response.status}`);
    return response.json();
  }

  async getStorage(): Promise<FujifilmStorageInfo> {
    const response = await fetch(`${this.baseUrl}/device/storage`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get storage: ${response.status}`);
    return response.json();
  }

  // ============================================
  // Shooting Settings
  // ============================================

  async getAllSettings(): Promise<FujifilmSettings> {
    const response = await fetch(`${this.baseUrl}/shooting/settings`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get settings: ${response.status}`);
    return response.json();
  }

  async getAperture(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/aperture`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get aperture: ${response.status}`);
    return response.json();
  }

  async setAperture(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/aperture`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set aperture: ${response.status}`);
  }

  async getShutterSpeed(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/shutterspeed`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get shutter speed: ${response.status}`);
    return response.json();
  }

  async setShutterSpeed(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/shutterspeed`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set shutter speed: ${response.status}`);
  }

  async getISO(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/iso`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get ISO: ${response.status}`);
    return response.json();
  }

  async setISO(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/iso`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set ISO: ${response.status}`);
  }

  async getWhiteBalance(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/whitebalance`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get white balance: ${response.status}`);
    return response.json();
  }

  async setWhiteBalance(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/whitebalance`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set white balance: ${response.status}`);
  }

  async getExposureCompensation(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/exposurecompensation`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get exposure compensation: ${response.status}`);
    return response.json();
  }

  async setExposureCompensation(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/exposurecompensation`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set exposure compensation: ${response.status}`);
  }

  async getFocusMode(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/focusmode`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get focus mode: ${response.status}`);
    return response.json();
  }

  async setFocusMode(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/focusmode`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set focus mode: ${response.status}`);
  }

  async getAFMode(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/afmode`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get AF mode: ${response.status}`);
    return response.json();
  }

  async setAFMode(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/afmode`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set AF mode: ${response.status}`);
  }

  async getMeteringMode(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/meteringmode`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get metering mode: ${response.status}`);
    return response.json();
  }

  async setMeteringMode(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/meteringmode`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set metering mode: ${response.status}`);
  }

  async getFilmSimulation(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/filmsimulation`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get film simulation: ${response.status}`);
    return response.json();
  }

  async setFilmSimulation(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/filmsimulation`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set film simulation: ${response.status}`);
  }

  async getImageQuality(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/imagequality`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get image quality: ${response.status}`);
    return response.json();
  }

  async setImageQuality(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/imagequality`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set image quality: ${response.status}`);
  }

  async getDynamicRange(): Promise<{ value: string; candidates: string[] }> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/dynamicrange`, {
      method: 'GET',
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get dynamic range: ${response.status}`);
    return response.json();
  }

  async setDynamicRange(value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/dynamicrange`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set dynamic range: ${response.status}`);
  }

  // ============================================
  // Shooting Control
  // ============================================

  async capture(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/capture`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Failed to capture: ${response.status}`);
  }

  async autoFocus(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/af`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to autofocus: ${response.status}`);
  }

  async startMovieRecording(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/movie/start`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to start recording: ${response.status}`);
  }

  async stopMovieRecording(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/movie/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
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
      headers: this.getHeaders(),
      body: JSON.stringify({ enable: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to start live view: ${response.status}`);
    return response.json();
  }

  async stopLiveView(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview`, {
      method: 'POST',
      headers: this.getHeaders(),
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
      headers: this.getHeaders(),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get contents: ${response.status}`);
    return response.json();
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopLiveView();
      if (this.sessionId) {
        await fetch(`${this.baseUrl}/disconnect`, {
          method: 'POST',
          headers: this.getHeaders(),
          signal: AbortSignal.timeout(3000),
        });
      }
    } catch {
      // Ignore
    }
    this.sessionId = null;
    this.connected = false;
  }
}

export function createFujifilmApiClient(config: FujifilmAPIConfig): FujifilmApiClient {
  return new FujifilmApiClient(config);
}
