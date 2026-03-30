import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Brush,
  Circle,
  Droplet,
  Mountain,
  Package,
  PlusCircle,
  Repeat,
  Search,
  Sprout,
  Wrench,
  Save,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { EventFormData } from '../types/events';
import { eventFormSchema } from '../features/events/schemas/eventSchema';
import { buildEventPayload } from '../features/events/utils/eventUtils';
import { resolveActiveDevice, resolvePhaseForDate } from '../features/phases/utils/phaseUtils';
import { useCreateEvent } from '../features/events/api/eventQueries';
import { EVENT_PRESETS } from '../constants/presets';
import { ZONES } from '../constants/zones';
import { ACTIONS } from '../constants/actions';
import { RESOURCES } from '../constants/resources';
import { getCurrentDateTime } from '../lib/dates';
import { cn } from '../lib/utils';

export function NewEventPage() {
  const navigate = useNavigate();
  const { mutate: createEvent, isPending } = useCreateEvent();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      observedAt: getCurrentDateTime(),
      eventType: 'OBSERVATION',
      zone: 'forrajeo',
      action: 'inspeccion',
      detail: '',
    },
  });
  
  const watchedValues = watch();
  
  // Fetch active device on mount
  useEffect(() => {
    resolveActiveDevice().then(setDeviceId).catch(console.error);
  }, []);
  
  const onSubmit = async (data: EventFormData) => {
    if (!deviceId) {
      toast.error('No se pudo determinar el dispositivo activo');
      return;
    }
    
    try {
      const phaseId = await resolvePhaseForDate(deviceId, data.observedAt);
      const payload = buildEventPayload(data, deviceId, phaseId);
      
      createEvent(payload, {
        onSuccess: () => {
          toast.success('Evento registrado exitosamente');
          navigate('/');
        },
        onError: (error) => {
          toast.error('Error al registrar el evento');
          console.error('Error creating event:', error);
        },
      });
    } catch (error) {
      toast.error('Error al procesar el evento');
      console.error('Error processing event:', error);
    }
  };
  
  const applyPreset = (preset: typeof EVENT_PRESETS[0]) => {
    Object.entries(preset.formData).forEach(([key, value]) => {
      setValue(key as keyof EventFormData, value as any);
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Cancelar</span>
          </button>
          <h1 className="text-lg font-semibold">Nuevo Evento</h1>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className={cn(
              'flex items-center px-4 py-2 rounded-lg font-medium',
              isPending 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            )}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Quick Presets */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Presets Rápidos</h2>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_PRESETS.slice(0, 6).map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors',
                  'bg-gray-800 border-gray-700 hover:bg-gray-700'
                )}
              >
                <div className="flex items-center">
                  {(() => {
                    const iconMap = {
                      search: Search,
                      circle: Circle,
                      package: Package,
                      seedling: Sprout,
                      broom: Brush,
                      mountain: Mountain,
                      'plus-circle': PlusCircle,
                      wrench: Wrench,
                      replace: Repeat,
                      droplet: Droplet,
                    } as const;

                    const Icon = iconMap[preset.icon as keyof typeof iconMap] ?? Zap;
                    return <Icon className="w-5 h-5 mr-2 text-gray-200" />;
                  })()}
                  <span className="text-sm font-medium">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora
            </label>
            <Controller
              name="observedAt"
              control={control}
              render={({ field }) => (
                <input
                  type="datetime-local"
                  {...field}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            />
            {errors.observedAt && (
              <p className="mt-1 text-sm text-red-400">{errors.observedAt.message}</p>
            )}
          </div>
          
          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Evento
            </label>
            <Controller
              name="eventType"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'OBSERVATION', label: 'Observación', color: 'green' },
                    { value: 'MAINTENANCE', label: 'Mantenimiento', color: 'blue' },
                    { value: 'EXCAVATION', label: 'Excavación', color: 'orange' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => field.onChange(type.value)}
                      className={cn(
                        'p-3 rounded-lg border text-sm font-medium transition-colors',
                        field.value === type.value
                          ? `bg-${type.color}-900 border-${type.color}-700 text-${type.color}-200`
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-400">{errors.eventType.message}</p>
            )}
          </div>
          
          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Zona
            </label>
            <Controller
              name="zone"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {ZONES.map((zone) => (
                    <button
                      key={zone}
                      type="button"
                      onClick={() => field.onChange(zone)}
                      className={cn(
                        'p-2 rounded-lg border text-sm transition-colors',
                        field.value === zone
                          ? 'bg-blue-900 border-blue-700 text-blue-200'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      )}
                    >
                      {zone.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.zone && (
              <p className="mt-1 text-sm text-red-400">{errors.zone.message}</p>
            )}
          </div>
          
          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Acción
            </label>
            <Controller
              name="action"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => field.onChange(action)}
                      className={cn(
                        'p-2 rounded-lg border text-sm transition-colors',
                        field.value === action
                          ? 'bg-blue-900 border-blue-700 text-blue-200'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      )}
                    >
                      {action.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.action && (
              <p className="mt-1 text-sm text-red-400">{errors.action.message}</p>
            )}
          </div>
          
          {/* Resource (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recurso (Opcional)
            </label>
            <Controller
              name="resource"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(undefined)}
                    className={cn(
                      'p-2 rounded-lg border text-sm transition-colors',
                      !field.value
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                    )}
                  >
                    Ninguno
                  </button>
                  {RESOURCES.map((resource) => (
                    <button
                      key={resource}
                      type="button"
                      onClick={() => field.onChange(resource)}
                      className={cn(
                        'p-2 rounded-lg border text-sm transition-colors',
                        field.value === resource
                          ? 'bg-blue-900 border-blue-700 text-blue-200'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      )}
                    >
                      {resource.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
          
          {/* Intensity (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Intensidad (Opcional)
            </label>
            <Controller
              name="intensity"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => field.onChange(undefined)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm transition-colors',
                      !field.value
                        ? 'bg-gray-700 border-gray-600 text-gray-200'
                        : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                    )}
                  >
                    Ninguna
                  </button>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => field.onChange(level)}
                      className={cn(
                        'w-12 h-12 rounded-lg border flex items-center justify-center font-medium transition-colors',
                        field.value === level
                          ? 'bg-yellow-900 border-yellow-700 text-yellow-200'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
          
          {/* Detail */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Detalle
            </label>
            <Controller
              name="detail"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={3}
                  placeholder="Describe el evento..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            />
            {errors.detail && (
              <p className="mt-1 text-sm text-red-400">{errors.detail.message}</p>
            )}
          </div>
          
          {/* Preview */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Vista Previa
            </h3>
            <p className="text-sm text-gray-200">
              {watchedValues.eventType} en {watchedValues.zone?.replace('_', ' ') || '[zona]'}: {watchedValues.action?.replace('_', ' ') || '[acción]'}
              {watchedValues.resource && ` de ${watchedValues.resource}`}
              {watchedValues.detail && `. ${watchedValues.detail}`}
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}
