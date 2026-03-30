export type EventType = "OBSERVATION" | "MAINTENANCE" | "EXCAVATION";

export interface Device {
  id: string;
  created_at: string;
  name: string;
  device_uid: string;
}

export interface ColonyPhase {
  id: string;
  created_at: string;
  device_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean | null;
}

export interface ColonyEvent {
  id: string;
  created_at: string;
  phase_id: string | null;
  device_id: string;
  event_type: EventType;
  description: string;
  observed_at: string;
  intensity: number | null;
  tags: string[] | null;
}

export interface SensorReading {
  id: string;
  created_at: string;
  device_id: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  temp_slope_15m: number | null;
  hum_slope_30m: number | null;
  active_window: boolean | null;
  event_flag: string | null;
}

export interface LatestDeviceReading {
  device_id: string;
  created_at: string;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
}

export interface ColonyIndicator {
  id: string;
  recorded_at: string;
  device_id: string;
  mortality_count: number | null;
  mold_status: string | null;
  water_system_status: string | null;
  risk_level: string | null;
  notes: string | null;
}

export interface Database {
  devices: Device;
  colony_phases: ColonyPhase;
  colony_events: ColonyEvent;
  sensor_readings: SensorReading;
  latest_device_readings: LatestDeviceReading;
  colony_indicators: ColonyIndicator;
}