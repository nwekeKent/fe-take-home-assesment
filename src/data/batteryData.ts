import batteryJson from './battery.json';

export interface BatteryRecord {
  academyId: number;
  batteryLevel: number;
  employeeId: string;
  serialNumber: string;
  timestamp: string;
}

export const batteryData: BatteryRecord[] = batteryJson as BatteryRecord[];

export default batteryData;
