export interface BatteryRecord {
  academyId: number;
  batteryLevel: number;
  employeeId: string;
  serialNumber: string;
  timestamp: string;
}

const mockBatteryData: BatteryRecord[] = [
  {
    academyId: 1,
    batteryLevel: 0.85,
    employeeId: 'EMP001',
    serialNumber: 'SN001',
    timestamp: '2024-01-01T10:00:00Z'
  },
  {
    academyId: 2,
    batteryLevel: 0.45,
    employeeId: 'EMP002',
    serialNumber: 'SN002',
    timestamp: '2024-01-02T11:00:00Z'
  },
  {
    academyId: 3,
    batteryLevel: 0.15,
    employeeId: 'EMP003',
    serialNumber: 'SN003',
    timestamp: '2024-01-03T12:00:00Z'
  }
];

export default mockBatteryData;
