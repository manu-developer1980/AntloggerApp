import { EventType } from './db';

export interface EventFormData {
  observedAt: string;
  eventType: EventType;
  zone: string;
  action: string;
  resource?: string;
  detail: string;
  intensity?: number;
}

export interface EventPreset {
  id: string;
  name: string;
  icon: string;
  formData: Partial<EventFormData>;
}

export interface EventFilters {
  startDate?: string;
  endDate?: string;
  eventType?: EventType;
  tags?: string[];
  searchText?: string;
}