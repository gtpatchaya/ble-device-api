export interface RegisterDeviceBody {
  serialNumber: string;
  model: string;
  firmwareVersion?: string;
  hardwareVersion?: string;
  connectType?: 'BLE' | 'WiFi' | 'USB';
  ownerType: 'USER' | 'ORGANIZATION';
  ownerId: string;
  unitId?: number;
  languageId?: number;
  testModeId?: number;
  location?: {
    lat: number;
    lng: number;
  };
  notes?: string;
}