import { EventPreset } from '../types/events';

export const EVENT_PRESETS: EventPreset[] = [
  {
    id: 'inspection-forrajeo',
    name: 'Inspección en forrajeo',
    icon: 'search',
    formData: {
      eventType: 'OBSERVATION',
      zone: 'forrajeo',
      action: 'inspeccion',
      detail: 'Inspección en forrajeo'
    }
  },
  {
    id: 'inspection-tubo',
    name: 'Inspección en tubo',
    icon: 'circle',
    formData: {
      eventType: 'OBSERVATION',
      zone: 'tubo',
      action: 'inspeccion',
      detail: 'Inspección en tubo'
    }
  },
  {
    id: 'transport-protein',
    name: 'Transporte de proteína',
    icon: 'package',
    formData: {
      eventType: 'OBSERVATION',
      zone: 'forrajeo',
      action: 'transporte',
      resource: 'proteina',
      detail: 'Transporte de proteína'
    }
  },
  {
    id: 'transport-seeds',
    name: 'Transporte de semillas',
    icon: 'seedling',
    formData: {
      eventType: 'OBSERVATION',
      zone: 'forrajeo',
      action: 'transporte',
      resource: 'semillas',
      detail: 'Transporte de semillas'
    }
  },
  {
    id: 'cleanup-waste',
    name: 'Limpieza de restos',
    icon: 'broom',
    formData: {
      eventType: 'OBSERVATION',
      zone: 'forrajeo',
      action: 'limpieza',
      resource: 'restos',
      detail: 'Limpieza de restos'
    }
  },
  {
    id: 'excavation-arena',
    name: 'Excavación / arena',
    icon: 'mountain',
    formData: {
      eventType: 'EXCAVATION',
      zone: 'forrajeo',
      action: 'excavacion',
      resource: 'arena',
      detail: 'Excavación de arena'
    }
  },
  {
    id: 'replace-protein',
    name: 'Reposición de proteína',
    icon: 'plus-circle',
    formData: {
      eventType: 'MAINTENANCE',
      zone: 'forrajeo',
      action: 'reposicion',
      resource: 'proteina',
      detail: 'Reposición de proteína'
    }
  },
  {
    id: 'replace-seeds',
    name: 'Reposición de semillas',
    icon: 'plus-circle',
    formData: {
      eventType: 'MAINTENANCE',
      zone: 'forrajeo',
      action: 'reposicion',
      resource: 'semillas',
      detail: 'Reposición de semillas'
    }
  },
  {
    id: 'structural-adjustment',
    name: 'Ajuste estructural',
    icon: 'wrench',
    formData: {
      eventType: 'MAINTENANCE',
      zone: 'tubo',
      action: 'ajuste_estructural',
      detail: 'Ajuste estructural'
    }
  },
  {
    id: 'module-change',
    name: 'Cambio de módulo',
    icon: 'replace',
    formData: {
      eventType: 'MAINTENANCE',
      zone: 'forrajeo',
      action: 'actualizacion_modulo',
      detail: 'Cambio de módulo'
    }
  },
  {
    id: 'add-bluesugar',
    name: 'Añadir BlueSugar / bebedero',
    icon: 'droplet',
    formData: {
      eventType: 'MAINTENANCE',
      zone: 'forrajeo',
      action: 'reposicion',
      resource: 'bluesugar',
      detail: 'Añadir BlueSugar'
    }
  }
];