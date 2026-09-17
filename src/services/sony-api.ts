/**
 * Sony Camera Remote API Client
 * 
 * Based on Sony's Camera Remote SDK and the Alpha Camera REST API.
 * Supports both the legacy JSON-RPC API (Smart Remote Control) and
 * the newer REST API via the @alpha-sdk/api server.
 * 
 * Reference: https://developer.sony.com/develop/cameras/
 *            https://sony-88f06855.mintlify.app/web-api/overview
 */

// ============================================
// Types
// ============================================

export interface SonyAPIConfig {
  /** For legacy JSON-RPC API: camera's IP address */
  ipAddress?: string;
  /** For legacy JSON-RPC API: typically 10000 */
  port?: number;
  /** For new REST API: server base URL (default: http://localhost:8080) */
  serverUrl?: string;
  /** API mode: 'legacy' for JSON-RPC, 'rest' for Alpha REST API */
  mode?: 'legacy' | 'rest';
}

export interface SonyCameraInfo {
  id: string;
  model: string;
  connected: boolean;
  serialNumber?: string;
}

export interface SonyAPIResponse<T = unknown> {
  success: boolean;
  message: string;
  camera?: SonyCameraInfo;
  data?: T;
}

export interface SonySettings {
  iso?: string;
  aperture?: string;
  shutterSpeed?: string;
  whiteBalance?: string;
  exposureCompensation?: string;
  focusMode?: string;
  driveMode?: string;
  stillQuality?: string;
  meteringMode?: string;
  flashMode?: string;
  colorSpace?: string;
  pictureEffect?: string;
}

export interface SonyAvailableSettings {
  iso?: { current: string; candidates: string[] };
  aperture?: { current: string; candidates: string[] };
  shutterSpeed?: { current: string; candidates: string[] };
  whiteBalance?: { current: string; candidates: string[] };
  exposureCompensation?: { current: string; candidates: string[] };
  focusMode?: { current: string; candidates: string[] };
  driveMode?: { current: string; candidates: string[] };
  stillQuality?: { current: string; candidates: string[] };
}

export interface SonyLiveViewInfo {
  url?: string;
  active: boolean;
}

// ============================================
// Legacy JSON-RPC Client (Smart Remote Control)
// ============================================

export class SonyLegacyClient {
  private baseUrl: string;
  private connected: boolean = false;

  constructor(config: SonyAPIConfig) {
    const ip = config.ipAddress || '192.168.122.1';
    const port = config.port || 10000;
    this.baseUrl = `http://${ip}:${port}/sony`;
  }

  private async call(method: string, params: unknown[] = []): Promise<unknown> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method,
        params,
        id: 1,
        version: '1.0',
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Sony API error: ${response.status}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error[1] || 'Unknown Sony API error');
    return data.result;
  }

  async ping(): Promise<boolean> {
    try {
      await this.call('getApplicationList');
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAvailableApiList(): Promise<string[]> {
    const result = await this.call('getAvailableApiList');
    return (result as { apiList: string[] }).apiList;
  }

  async getCameraModel(): Promise<string> {
    const result = await this.call('getCameraFunction');
    return (result as string[])?.[0] || 'Unknown';
  }

  // Shooting
  async capture(): Promise<void> {
    await this.call('actTakePicture');
  }

  async halfPressShutter(): Promise<void> {
    await this.call('actHalfPressShutter');
  }

  async cancelHalfPress(): Promise<void> {
    await this.call('cancelHalfPressShutter');
  }

  async startMovieRecording(): Promise<void> {
    await this.call('startMovieRec');
  }

  async stopMovieRecording(): Promise<void> {
    await this.call('stopMovieRec');
  }

  // Settings
  async getISO(): Promise<{ current: string; candidates: string[] }> {
    const result = await this.call('getAvailableIsoSpeedRate');
    return result as { current: string; candidates: string[] };
  }

  async setISO(value: string): Promise<void> {
    await this.call('setIsoSpeedRate', [value]);
  }

  async getAperture(): Promise<{ current: string; candidates: string[] }> {
    const result = await this.call('getAvailableFNumber');
    return result as { current: string; candidates: string[] };
  }

  async setAperture(value: string): Promise<void> {
    await this.call('setFNumber', [value]);
  }

  async getShutterSpeed(): Promise<{ current: string; candidates: string[] }> {
    const result = await this.call('getAvailableShutterSpeed');
    return result as { current: string; candidates: string[] };
  }

  async setShutterSpeed(value: string): Promise<void> {
    await this.call('setShutterSpeed', [value]);
  }

  async getWhiteBalance(): Promise<{ current: string; candidates: string[] }> {
    const result = await this.call('getAvailableWhiteBalance');
    return result as { current: string; candidates: string[] };
  }

  async setWhiteBalance(value: string): Promise<void> {
    await this.call('setWhiteBalance', [value]);
  }

  async getExposureCompensation(): Promise<{ current: string; candidates: string[]; min: number; max: number; step: number }> {
    const result = await this.call('getAvailableExposureCompensation');
    return result as { current: string; candidates: string[]; min: number; max: number; step: number };
  }

  async setExposureCompensation(value: string): Promise<void> {
    await this.call('setExposureCompensation', [value]);
  }

  async getFocusMode(): Promise<{ current: string; candidates: string[] }> {
    const result = await this.call('getAvailableFocusMode');
    return result as { current: string; candidates: string[] };
  }

  async setFocusMode(value: string): Promise<void> {
    await this.call('setFocusMode', [value]);
  }

  async getDriveMode(): Promise<{ current: string; candidates: string[] }> {
    const result = await this.call('getAvailableStillQuality');
    return result as { current: string; candidates: string[] };
  }

  async setDriveMode(value: string): Promise<void> {
    await this.call('setStillQuality', [value]);
  }

  // Live View
  async startLiveView(): Promise<string> {
    const result = await this.call('startLiveview');
    return (result as string[])?.[0] || '';
  }

  async stopLiveView(): Promise<void> {
    await this.call('stopLiveview');
  }

  // Zoom
  async zoomIn(): Promise<void> {
    await this.call('actZoom', ['in', '1shot']);
  }

  async zoomOut(): Promise<void> {
    await this.call('actZoom', ['out', '1shot']);
  }

  // AF
  async setAFPosition(x: number, y: number): Promise<void> {
    await this.call('setTouchAFPosition', [x, y]);
  }
}

// ============================================
// New REST API Client (Alpha SDK Server)
// ============================================

export class SonyRestClient {
  private baseUrl: string;
  private cameraId: string | null = null;
  private connected: boolean = false;

  constructor(config: SonyAPIConfig) {
    this.baseUrl = config.serverUrl || 'http://localhost:8080';
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<SonyAPIResponse<T>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Sony REST API error: ${response.status}`);
    return response.json();
  }

  async ping(): Promise<boolean> {
    try {
      await this.request('GET', '/api/cameras');
      this.connected = true;
      return true;
    } catch {
      this.connected = false;
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async discoverCameras(): Promise<SonyCameraInfo[]> {
    const response = await this.request<SonyCameraInfo[]>('GET', '/api/cameras');
    return response.data || [];
  }

  async connect(cameraId: string, mode: 'remote' | 'remote-transfer' | 'contents' = 'remote'): Promise<void> {
    await this.request('POST', `/api/cameras/${cameraId}/connection`, { mode });
    this.cameraId = cameraId;
    this.connected = true;

    // Set priority key for remote control
    if (mode === 'remote' || mode === 'remote-transfer') {
      await this.request('PUT', `/api/cameras/${cameraId}/priority-key`, {
        setting: 'pc-remote',
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.cameraId) {
      await this.request('DELETE', `/api/cameras/${this.cameraId}/connection`);
    }
    this.cameraId = null;
    this.connected = false;
  }

  private get cameraPath(): string {
    if (!this.cameraId) throw new Error('No camera connected');
    return `/api/cameras/${this.cameraId}`;
  }

  // Shooting
  async capture(): Promise<void> {
    await this.request('POST', `${this.cameraPath}/actions/af-shutter`);
  }

  async shutterOnly(): Promise<void> {
    await this.request('POST', `${this.cameraPath}/actions/shutter`);
  }

  async autoFocus(): Promise<void> {
    await this.request('POST', `${this.cameraPath}/actions/af`);
  }

  async startRecording(): Promise<void> {
    await this.request('POST', `${this.cameraPath}/actions/movie-start`);
  }

  async stopRecording(): Promise<void> {
    await this.request('POST', `${this.cameraPath}/actions/movie-stop`);
  }

  // Settings
  async getProperty(name: string): Promise<{ value: string; candidates?: string[] }> {
    const response = await this.request<{ value: string; candidates?: string[] }>(
      'GET',
      `${this.cameraPath}/properties/${name}`
    );
    return response.data || { value: '' };
  }

  async setProperty(name: string, value: string): Promise<void> {
    await this.request('PUT', `${this.cameraPath}/properties/${name}`, { value });
  }

  async getISO() { return this.getProperty('iso'); }
  async setISO(value: string) { return this.setProperty('iso', value); }

  async getAperture() { return this.getProperty('fnumber'); }
  async setAperture(value: string) { return this.setProperty('fnumber', value); }

  async getShutterSpeed() { return this.getProperty('shutter-speed'); }
  async setShutterSpeed(value: string) { return this.setProperty('shutter-speed', value); }

  async getWhiteBalance() { return this.getProperty('white-balance'); }
  async setWhiteBalance(value: string) { return this.setProperty('white-balance', value); }

  async getExposureCompensation() { return this.getProperty('exposure-compensation'); }
  async setExposureCompensation(value: string) { return this.setProperty('exposure-compensation', value); }

  async getFocusMode() { return this.getProperty('focus-mode'); }
  async setFocusMode(value: string) { return this.setProperty('focus-mode', value); }

  async getDriveMode() { return this.getProperty('drive-mode'); }
  async setDriveMode(value: string) { return this.setProperty('drive-mode', value); }

  async getStillQuality() { return this.getProperty('still-quality'); }
  async setStillQuality(value: string) { return this.setProperty('still-quality', value); }

  async getMeteringMode() { return this.getProperty('metering-mode'); }
  async setMeteringMode(value: string) { return this.setProperty('metering-mode', value); }

  // Live View
  async startLiveView(): Promise<string> {
    const response = await this.request<{ url: string }>('POST', `${this.cameraPath}/actions/liveview-start`);
    return response.data?.url || '';
  }

  async stopLiveView(): Promise<void> {
    await this.request('POST', `${this.cameraPath}/actions/liveview-stop`);
  }

  getLiveViewUrl(): string {
    if (!this.cameraId) return '';
    return `${this.baseUrl}${this.cameraPath}/liveview`;
  }

  // Contents
  async getContents(): Promise<unknown[]> {
    const response = await this.request<unknown[]>('GET', `${this.cameraPath}/contents`);
    return response.data || [];
  }
}

// ============================================
// Unified Sony Client
// ============================================

export class SonyApiClient {
  private client: SonyLegacyClient | SonyRestClient;
  private apiMode: 'legacy' | 'rest';

  constructor(config: SonyAPIConfig) {
    this.apiMode = config.mode || 'rest';
    if (this.apiMode === 'legacy') {
      this.client = new SonyLegacyClient(config);
    } else {
      this.client = new SonyRestClient(config);
    }
  }

  async ping(): Promise<boolean> {
    return this.client.ping();
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  getApiMode(): 'legacy' | 'rest' {
    return this.apiMode;
  }

  // Unified interface
  async capture(): Promise<void> {
    return this.client.capture();
  }

  async startLiveView(): Promise<string> {
    return this.client.startLiveView();
  }

  async stopLiveView(): Promise<void> {
    return this.client.stopLiveView();
  }

  async getISO() { return this.client.getISO(); }
  async setISO(value: string) { return this.client.setISO(value); }
  async getAperture() { return this.client.getAperture(); }
  async setAperture(value: string) { return this.client.setAperture(value); }
  async getShutterSpeed() { return this.client.getShutterSpeed(); }
  async setShutterSpeed(value: string) { return this.client.setShutterSpeed(value); }
  async getWhiteBalance() { return this.client.getWhiteBalance(); }
  async setWhiteBalance(value: string) { return this.client.setWhiteBalance(value); }
  async getFocusMode() { return this.client.getFocusMode(); }
  async setFocusMode(value: string) { return this.client.setFocusMode(value); }

  async autoFocus(): Promise<void> {
    if (this.client instanceof SonyRestClient) {
      await this.client.autoFocus();
    } else if (this.client instanceof SonyLegacyClient) {
      await this.client.halfPressShutter();
    }
  }

  async setMeteringMode(value: string): Promise<void> {
    if (this.client instanceof SonyRestClient) {
      await this.client.setProperty('metering-mode', value);
    }
  }

  async setDriveMode(value: string): Promise<void> {
    if (this.client instanceof SonyRestClient) {
      await this.client.setDriveMode(value);
    }
  }

  async setImageQuality(value: string): Promise<void> {
    if (this.client instanceof SonyRestClient) {
      await this.client.setStillQuality(value);
    }
  }

  getRawClient(): SonyLegacyClient | SonyRestClient {
    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.client instanceof SonyRestClient) {
      await this.client.disconnect();
    }
  }
}

export function createSonyApiClient(config: SonyAPIConfig): SonyApiClient {
  return new SonyApiClient(config);
}
