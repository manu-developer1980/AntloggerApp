import { EventFormData } from '../../../types/events';
import { capitalize } from '../../../lib/utils';

export function buildEventDescription(data: EventFormData): string {
  const parts: string[] = [];
  
  // Action
  const actionText = data.action.replace('_', ' ');
  parts.push(capitalize(actionText));
  
  // Zone
  if (data.zone) {
    parts.push(`en ${data.zone.replace('_', ' ')}`);
  }
  
  // Resource
  if (data.resource) {
    parts.push(`de ${data.resource}`);
  }
  
  // Detail
  if (data.detail?.trim()) {
    parts.push(`. ${data.detail.trim()}`);
  }
  
  return parts.join(' ').replace('..', '.');
}

export function buildEventTags(data: EventFormData): string[] {
  const tags: string[] = [];
  
  // Add zone tag
  if (data.zone) {
    tags.push(data.zone);
  }
  
  // Add action tag
  if (data.action) {
    tags.push(data.action);
  }
  
  // Add resource tag
  if (data.resource) {
    tags.push(data.resource);
  }
  
  // Add activity-based tags
  if (data.action === 'inspeccion' || data.action === 'exploracion') {
    tags.push('exploracion');
  }
  
  if (data.action === 'reclutamiento' || data.action === 'patrulla') {
    tags.push('actividad_social');
  }
  
  // Remove duplicates and return
  return [...new Set(tags)];
}

export function buildEventPayload(data: EventFormData, deviceId: string, phaseId: string | null) {
  return {
    device_id: deviceId,
    phase_id: phaseId,
    event_type: data.eventType,
    description: buildEventDescription(data),
    observed_at: data.observedAt,
    intensity: data.intensity || null,
    tags: buildEventTags(data)
  };
}