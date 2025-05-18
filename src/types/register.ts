export interface RegisterDeviceBody {
  serialNumber: string;
  name: string;
  model: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  connectType?: 'BLE' | 'WiFi' | 'USB';
  ownerType: 'USER' | 'ORGANIZATION';
  ownerId: string;
  unitId?: number;
  languageId?: number;
  testModeId?: number;
  deviceId: string;
  userId: string;
  location?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}