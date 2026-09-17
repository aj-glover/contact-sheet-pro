/**
 * Canon Camera Control API (CCAPI) Client
 * 
 * RESTful API for controlling compatible Canon cameras over HTTP.
 * Base URL: http://[IPAddress]:[PortNumber]/ccapi/[Version]
 * 
 * Reference: https://developercommunity.usa.canon.com/s/article/CCAPI-Function-List
 */

export interface CCAPIConfig {
  ipAddress: string;
  port: number;
  version?: string;
}

export interface DeviceInfo {
  productname: string;
  description?: string;
  firmwareversion?: string;
  ownersname?: string;
  uniqueid?: string;
}

export interface BatteryInfo {
  kind: number;
  level: number; // 0-100
  status: string; // "normal" | "drained" | "charge" | etc.
}

export interface StorageInfo {
  storages: Array<{
    id: string;
    label?: string;
    capacity?: number;
    spaces?: Array<{
      id: string;
      name?: string;
      maxcapacity?: number;
      numfiles?: number;
      numfolders?: number;
    }>;
  }>;
}

export interface LensInfo {
  name?: string;
  focallength?: number;
}

export interface ShootingSettings {
  shootingmodedial?: SettingValue;
  av?: SettingValue;
  tv?: SettingValue;
  iso?: SettingValue;
  wb?: SettingValue;
  metering?: SettingValue;
  drive?: SettingValue;
  afmethod?: SettingValue;
  stillimagequality?: SettingValue;
  stillimageaspectratio?: SettingValue;
  exposure?: SettingValue;
  colorspace?: SettingValue;
  picturestyle?: SettingValue;
}

export interface SettingValue {
  value: string;
  ablechange?: boolean;
  current?: string;
  currentDisplay?: string;
  params?: Array<{
    value: string;
    display?: string;
  }>;
}

export interface LiveViewInfo {
  enable: boolean;
  url?: string;
}

export interface ContentItem {
  name: string;
  url: string;
  kind?: string;
  thumbnailurl?: string;
  attribute?: {
    filesize?: number;
    width?: number;
    height?: number;
    datetime?: string;
  };
}

export interface EventData {
  addedcontents?: string[];
  deletedcontents?: string[];
  devicestatus?: {
    storage?: StorageInfo;
    battery?: BatteryInfo;
    temperature?: { status: string };
  };
  shootingsetting?: ShootingSettings;
}

export class CCApiClient {
  private baseUrl: string;
  private version: string;
  private connected: boolean = false;
  private eventPollUrl: string | null = null;

  constructor(config: CCAPIConfig) {
    this.version = config.version || 'ver100';
    this.baseUrl = `http://${config.ipAddress}:${config.port}/ccapi/${this.version}`;
  }

  /**
   * Test connection to the camera
   */
  async ping(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      this.connected = response.ok;
      return response.ok;
    } catch {
      this.connected = false;
      return false;
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // ============================================
  // Device Information
  // ============================================

  /**
   * Acquire camera's peculiar information
   * GET /ccapi/{version}/deviceinformation
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    const response = await fetch(`${this.baseUrl}/deviceinformation`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get device info: ${response.status}`);
    return response.json();
  }

  /**
   * Acquire battery information
   * GET /ccapi/{version}/devicestatus/battery
   */
  async getBattery(): Promise<BatteryInfo> {
    const response = await fetch(`${this.baseUrl}/devicestatus/battery`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get battery info: ${response.status}`);
    return response.json();
  }

  /**
   * Acquire storage information
   * GET /ccapi/{version}/devicestatus/storage
   */
  async getStorage(): Promise<StorageInfo> {
    const response = await fetch(`${this.baseUrl}/devicestatus/storage`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get storage info: ${response.status}`);
    return response.json();
  }

  /**
   * Acquire lens information
   * GET /ccapi/{version}/devicestatus/lens
   */
  async getLens(): Promise<LensInfo> {
    const response = await fetch(`${this.baseUrl}/devicestatus/lens`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get lens info: ${response.status}`);
    return response.json();
  }

  /**
   * Acquire temperature warning information
   * GET /ccapi/{version}/devicestatus/temperature
   */
  async getTemperature(): Promise<{ status: string }> {
    const response = await fetch(`${this.baseUrl}/devicestatus/temperature`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get temperature: ${response.status}`);
    return response.json();
  }

  // ============================================
  // Shooting Settings
  // ============================================

  /**
   * Acquire all shooting settings
   * GET /ccapi/{version}/shooting/settings
   */
  async getAllSettings(): Promise<ShootingSettings> {
    const response = await fetch(`${this.baseUrl}/shooting/settings`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get settings: ${response.status}`);
    return response.json();
  }

  /**
   * Get aperture (AV) value and available values
   */
  async getAperture(): Promise<SettingValue> {
    return this.getSetting('av');
  }

  /**
   * Set aperture (AV)
   */
  async setAperture(value: string): Promise<void> {
    await this.setSetting('av', value);
  }

  /**
   * Get shutter speed (TV) value and available values
   */
  async getShutterSpeed(): Promise<SettingValue> {
    return this.getSetting('tv');
  }

  /**
   * Set shutter speed (TV)
   */
  async setShutterSpeed(value: string): Promise<void> {
    await this.setSetting('tv', value);
  }

  /**
   * Get ISO value and available values
   */
  async getISO(): Promise<SettingValue> {
    return this.getSetting('iso');
  }

  /**
   * Set ISO
   */
  async setISO(value: string): Promise<void> {
    await this.setSetting('iso', value);
  }

  /**
   * Get white balance value and available values
   */
  async getWhiteBalance(): Promise<SettingValue> {
    return this.getSetting('wb');
  }

  /**
   * Set white balance
   */
  async setWhiteBalance(value: string): Promise<void> {
    await this.setSetting('wb', value);
  }

  /**
   * Get metering mode
   */
  async getMetering(): Promise<SettingValue> {
    return this.getSetting('metering');
  }

  /**
   * Set metering mode
   */
  async setMetering(value: string): Promise<void> {
    await this.setSetting('metering', value);
  }

  /**
   * Get drive mode
   */
  async getDriveMode(): Promise<SettingValue> {
    return this.getSetting('drive');
  }

  /**
   * Set drive mode
   */
  async setDriveMode(value: string): Promise<void> {
    await this.setSetting('drive', value);
  }

  /**
   * Get AF method
   */
  async getAFMethod(): Promise<SettingValue> {
    return this.getSetting('afmethod');
  }

  /**
   * Set AF method
   */
  async setAFMethod(value: string): Promise<void> {
    await this.setSetting('afmethod', value);
  }

  /**
   * Get still image quality
   */
  async getImageQuality(): Promise<SettingValue> {
    return this.getSetting('stillimagequality');
  }

  /**
   * Set still image quality
   */
  async setImageQuality(value: string): Promise<void> {
    await this.setSetting('stillimagequality', value);
  }

  /**
   * Get exposure compensation
   */
  async getExposure(): Promise<SettingValue> {
    return this.getSetting('exposure');
  }

  /**
   * Set exposure compensation
   */
  async setExposure(value: string): Promise<void> {
    await this.setSetting('exposure', value);
  }

  /**
   * Get shooting mode
   */
  async getShootingMode(): Promise<SettingValue> {
    return this.getSetting('shootingmodedial');
  }

  /**
   * Generic setting getter
   */
  private async getSetting(setting: string): Promise<SettingValue> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/${setting}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get ${setting}: ${response.status}`);
    return response.json();
  }

  /**
   * Generic setting setter
   */
  private async setSetting(setting: string, value: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/settings/${setting}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set ${setting}: ${response.status}`);
  }

  // ============================================
  // Shooting Control
  // ============================================

  /**
   * Trigger shutter (capture still image)
   * POST /ccapi/{version}/shooting/control/shutterbutton
   */
  async capture(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/shutterbutton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Failed to capture: ${response.status}`);
  }

  /**
   * Manual shutter button control (half-press, full-press, release)
   * POST /ccapi/{version}/shooting/control/shutterbutton/manual
   */
  async shutterButtonManual(action: '1' | '2' | '3'): Promise<void> {
    // 1 = half-press, 2 = full-press, 3 = release
    const response = await fetch(`${this.baseUrl}/shooting/control/shutterbutton/manual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Failed shutter control: ${response.status}`);
  }

  /**
   * Perform AF (autofocus)
   * POST /ccapi/{version}/shooting/control/af
   */
  async performAF(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/af`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed AF: ${response.status}`);
  }

  /**
   * Drive focus (manual focus control)
   * POST /ccapi/{version}/shooting/control/drivefocus
   */
  async driveFocus(direction: 'far' | 'near'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/drivefocus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed drive focus: ${response.status}`);
  }

  /**
   * Zoom control
   * POST /ccapi/{version}/shooting/control/zoom
   */
  async zoom(direction: 'in' | 'out'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/zoom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed zoom: ${response.status}`);
  }

  /**
   * Start/stop movie recording
   * POST /ccapi/{version}/shooting/control/recbutton
   */
  async toggleRecording(start: boolean): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/control/recbutton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed recording control: ${response.status}`);
  }

  // ============================================
  // Live View
  // ============================================

  /**
   * Start live view
   * POST /ccapi/{version}/shooting/liveview
   */
  async startLiveView(): Promise<LiveViewInfo> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: true }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to start live view: ${response.status}`);
    return response.json();
  }

  /**
   * Stop live view
   * POST /ccapi/{version}/shooting/liveview
   */
  async stopLiveView(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enable: false }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to stop live view: ${response.status}`);
  }

  /**
   * Get live view JPEG frame URL
   * This returns an MJPEG stream URL that can be used in an <img> tag
   */
  getLiveViewStreamUrl(): string {
    return `${this.baseUrl}/shooting/liveview/jpeg`;
  }

  /**
   * Get live view flip setting
   */
  async getLiveViewFlip(): Promise<{ flip: string }> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview/flip`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get live view flip: ${response.status}`);
    return response.json();
  }

  /**
   * Set live view flip
   */
  async setLiveViewFlip(flip: 'off' | 'horizontal' | 'vertical' | 'both'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/shooting/liveview/flip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flip }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set live view flip: ${response.status}`);
  }

  // ============================================
  // Contents / Image Download
  // ============================================

  /**
   * Get list of storage URLs
   * GET /ccapi/{version}/contents
   */
  async getContents(): Promise<{ url: string[] }> {
    const response = await fetch(`${this.baseUrl}/contents`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get contents: ${response.status}`);
    return response.json();
  }

  /**
   * Get contents of a specific storage (e.g., SD card)
   * GET /ccapi/{version}/contents/sd
   */
  async getStorageContents(storageId: string = 'sd'): Promise<{ url: string[] }> {
    const response = await fetch(`${this.baseUrl}/contents/${storageId}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get storage contents: ${response.status}`);
    return response.json();
  }

  // ============================================
  // Event Polling
  // ============================================

  /**
   * Start event polling (long polling)
   * GET /ccapi/{version}/event/polling
   */
  async startEventPolling(): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/event/polling`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to start event polling: ${response.status}`);
    const data = await response.json();
    this.eventPollUrl = data.url;
    return data;
  }

  /**
   * Poll for events (long polling)
   * GET [event polling URL]
   */
  async pollEvents(): Promise<EventData> {
    const url = this.eventPollUrl || `${this.baseUrl}/event/polling`;
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(30000), // Long poll timeout
    });
    if (!response.ok) throw new Error(`Failed to poll events: ${response.status}`);
    return response.json();
  }

  /**
   * Start event monitoring (chunked transfer)
   * GET /ccapi/{version}/event/monitoring
   */
  async startEventMonitoring(): Promise<ReadableStream<Uint8Array> | null> {
    const response = await fetch(`${this.baseUrl}/event/monitoring`, {
      method: 'GET',
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error(`Failed to start monitoring: ${response.status}`);
    return response.body;
  }

  // ============================================
  // Camera Functions
  // ============================================

  /**
   * Get/set camera nickname
   */
  async getNickname(): Promise<{ nickname: string }> {
    const response = await fetch(`${this.baseUrl}/functions/nickname`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to get nickname: ${response.status}`);
    return response.json();
  }

  /**
   * Set camera nickname
   */
  async setNickname(nickname: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/functions/nickname`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Failed to set nickname: ${response.status}`);
  }

  /**
   * Format storage card
   */
  async formatCard(storageId: string = 'sd'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/functions/cardformat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: storageId }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Failed to format card: ${response.status}`);
  }

  /**
   * Disconnect from camera
   */
  async disconnect(): Promise<void> {
    try {
      await this.stopLiveView();
    } catch {
      // Ignore errors during disconnect
    }
    this.connected = false;
    this.eventPollUrl = null;
  }
}

/**
 * Create a CCAPI client instance
 */
export function createCCApiClient(config: CCAPIConfig): CCApiClient {
  return new CCApiClient(config);
}
