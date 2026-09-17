export type ConnectionType = 'tethered' | 'wireless';
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface CameraDevice {
  id: string;
  name: string;
  model: string;
  serial: string;
  connectionType: ConnectionType;
  status: ConnectionStatus;
  batteryLevel: number;
  storageUsed: number;
  storageTotal: number;
  shotsRemaining: number;
  signalStrength?: number; // for wireless
  transferSpeed?: string; // for wireless
  port?: string; // for tethered
  firmware: string;
}

export interface ShootingSession {
  cameraId: string;
  startTime: string;
  shotsTaken: number;
  lastCaptureTime: string | null;
  autoImport: boolean;
  rawFormat: boolean;
  liveViewActive: boolean;
}

export interface CameraSettings {
  aperture: string;
  shutterSpeed: string;
  iso: string;
  whiteBalance: string;
  focusMode: string;
  driveMode: string;
  meteringMode: string;
  imageQuality: string;
}

export const availableCameras: CameraDevice[] = [
  {
    id: 'cam-1',
    name: 'Canon EOS R5',
    model: 'Canon EOS R5',
    serial: '032024001234',
    connectionType: 'tethered',
    status: 'connected',
    batteryLevel: 78,
    storageUsed: 42.3,
    storageTotal: 128,
    shotsRemaining: 2840,
    port: 'USB-C 3.2',
    firmware: '1.8.1',
  },
  {
    id: 'cam-2',
    name: 'Sony A7R V',
    model: 'Sony α7R V (ILCE-7RM5)',
    serial: '4128567',
    connectionType: 'wireless',
    status: 'connected',
    batteryLevel: 54,
    storageUsed: 87.6,
    storageTotal: 256,
    shotsRemaining: 4120,
    signalStrength: 82,
    transferSpeed: '45 MB/s',
    firmware: '2.01',
  },
  {
    id: 'cam-3',
    name: 'Nikon Z9',
    model: 'NIKON Z 9',
    serial: '2035891',
    connectionType: 'tethered',
    status: 'disconnected',
    batteryLevel: 92,
    storageUsed: 15.2,
    storageTotal: 128,
    shotsRemaining: 6200,
    port: 'USB-C 3.2',
    firmware: '5.10',
  },
  {
    id: 'cam-4',
    name: 'Fujifilm X-T5',
    model: 'FUJIFILM X-T5',
    serial: '11KA04782',
    connectionType: 'wireless',
    status: 'disconnected',
    batteryLevel: 65,
    storageUsed: 28.9,
    storageTotal: 64,
    shotsRemaining: 1540,
    signalStrength: 0,
    transferSpeed: '—',
    firmware: '1.20',
  },
];

export const defaultCameraSettings: CameraSettings = {
  aperture: 'f/2.8',
  shutterSpeed: '1/250',
  iso: 'ISO 400',
  whiteBalance: 'Auto',
  focusMode: 'AF-C',
  driveMode: 'Single',
  meteringMode: 'Evaluative',
  imageQuality: 'RAW + JPEG Fine',
};
