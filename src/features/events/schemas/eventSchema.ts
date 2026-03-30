import { z } from 'zod';
import { EventType } from '../../../types/db';
import { ZONES } from '../../../constants/zones';
import { ACTIONS } from '../../../constants/actions';
import { RESOURCES } from '../../../constants/resources';

export const eventFormSchema = z.object({
  observedAt: z.string().min(1, 'La fecha y hora son requeridas'),
  eventType: z.enum(['OBSERVATION', 'MAINTENANCE', 'EXCAVATION'] as const),
  zone: z.enum(ZONES),
  action: z.enum(ACTIONS),
  resource: z.enum(RESOURCES).optional(),
  detail: z.string().min(1, 'El detalle es requerido').max(500, 'El detalle no puede exceder 500 caracteres'),
  intensity: z.number().min(1).max(5).optional(),
});

export type EventFormSchema = z.infer<typeof eventFormSchema>;