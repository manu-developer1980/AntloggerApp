import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Filter, History, Pencil, Plus, Save, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { resolveActiveDevice } from '../features/phases/utils/phaseUtils';
import { useEvents, useUpdateEvent } from '../features/events/api/eventQueries';
import { EventFilters } from '../types/events';
import { EventType } from '../types/db';
import { datetimeLocalToUtcIso, formatDate, formatTime, utcIsoToDatetimeLocal } from '../lib/dates';
import { cn } from '../lib/utils';

export function HistoryPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({});
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editObservedAt, setEditObservedAt] = useState('');
  const [editEventType, setEditEventType] = useState<EventType>('OBSERVATION');
  const [editDescription, setEditDescription] = useState('');
  const [editIntensity, setEditIntensity] = useState<number | ''>('');
  const [editTags, setEditTags] = useState('');

  const skipAutoOpenRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  
  // Fetch active device on mount
  useEffect(() => {
    resolveActiveDevice().then(setDeviceId).catch(console.error);
  }, []);
  
  const { data: events, isLoading } = useEvents(deviceId, filters);
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const editEventFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('edit');
  }, [location.search]);

  const editingEvent = useMemo(() => {
    if (!events || !editingEventId) return null;
    return events.find((e) => e.id === editingEventId) ?? null;
  }, [events, editingEventId]);

  const openEditorForEvent = (eventId: string) => {
    const target = events?.find((e) => e.id === eventId);
    if (!target) return;

    setEditingEventId(eventId);
    setEditObservedAt(utcIsoToDatetimeLocal(target.observed_at));
    setEditEventType(target.event_type);
    setEditDescription(target.description);
    setEditIntensity(target.intensity ?? '');
    setEditTags((target.tags ?? []).join(', '));

    const params = new URLSearchParams(location.search);
    params.set('edit', eventId);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };

  const closeEditor = () => {
    skipAutoOpenRef.current = true;
    setEditingEventId(null);
    const params = new URLSearchParams(location.search);
    params.delete('edit');
    const nextSearch = params.toString();
    navigate({ pathname: location.pathname, search: nextSearch }, { replace: true });
  };

  useEffect(() => {
    if (!editingEventId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditor();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingEventId, location.pathname, location.search]);

  useEffect(() => {
    if (skipAutoOpenRef.current) {
      if (!editEventFromUrl) skipAutoOpenRef.current = false;
      return;
    }
    if (!editEventFromUrl) return;
    if (editingEventId === editEventFromUrl) return;
    if (!events || events.length === 0) return;
    const exists = events.some((e) => e.id === editEventFromUrl);
    if (!exists) return;
    openEditorForEvent(editEventFromUrl);
  }, [editEventFromUrl, events, editingEventId]);

  const saveEdit = async () => {
    if (!editingEventId) return;
    if (!editObservedAt || !editDescription.trim()) {
      toast.error('Completa fecha/hora y descripción');
      return;
    }

    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await updateEvent({
        id: editingEventId,
        event_type: editEventType,
        observed_at: datetimeLocalToUtcIso(editObservedAt),
        description: editDescription.trim(),
        intensity: editIntensity === '' ? null : Number(editIntensity),
        tags: tags.length > 0 ? tags : null,
      });
      toast.success('Evento actualizado');
      closeEditor();
    } catch (e) {
      toast.error('No se pudo actualizar el evento');
    }
  };
  
  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  );
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Volver</span>
          </Link>
          <h1 className="text-lg font-semibold">Historial</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center px-3 py-2 rounded-lg transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-sm">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha desde
                </label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha hasta
                </label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Tipo de evento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: '', label: 'Todos' },
                  { value: 'OBSERVATION', label: 'Observación' },
                  { value: 'MAINTENANCE', label: 'Mantenimiento' },
                  { value: 'EXCAVATION', label: 'Excavación' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleFilterChange('eventType', type.value || undefined)}
                    className={cn(
                      'p-2 rounded-lg border text-sm transition-colors',
                      filters.eventType === type.value || (!filters.eventType && type.value === '')
                        ? 'bg-blue-900 border-blue-700 text-blue-200'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Search Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Buscar en descripción
              </label>
              <input
                type="text"
                placeholder="Buscar por texto..."
                value={filters.searchText || ''}
                onChange={(e) => handleFilterChange('searchText', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div>Cargando eventos...</div>
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">
                {events.length} evento{events.length !== 1 ? 's' : ''} encontrado{events.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        event.event_type === 'OBSERVATION' && 'bg-green-900 text-green-200',
                        event.event_type === 'MAINTENANCE' && 'bg-blue-900 text-blue-200',
                        event.event_type === 'EXCAVATION' && 'bg-orange-900 text-orange-200'
                      )}>
                        {event.event_type}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(event.observed_at)} {formatTime(event.observed_at)}
                      </span>
                    </div>
                    <p className="text-gray-200 mb-2">{event.description}</p>
                    
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {event.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {event.intensity && (
                      <div className="flex items-center">
                        <span className="text-xs text-gray-400">Intensidad:</span>
                        <div className="flex ml-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                'w-2 h-2 rounded-full mr-1',
                                level <= event.intensity ? 'bg-yellow-400' : 'bg-gray-600'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditorForEvent(event.id)}
                      className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                      aria-label="Editar evento"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-lg mb-2">No se encontraron eventos</div>
            <div className="text-sm mb-4">
              {hasActiveFilters 
                ? 'Intenta ajustar los filtros o' 
                : 'No hay eventos registrados aún.'
              }
            </div>
            <Link
              to="/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar primer evento
            </Link>
          </div>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link
              to="/"
              className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-white"
            >
              <div className="w-6 h-6 mb-1">🏠</div>
              <span className="text-xs">Inicio</span>
            </Link>
            <Link
              to="/new"
              className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-white"
            >
              <Plus className="w-6 h-6 mb-1" />
              <span className="text-xs">Nuevo</span>
            </Link>
            <Link
              to="/history"
              className="flex flex-col items-center py-2 px-4 text-blue-400"
            >
              <History className="w-6 h-6 mb-1" />
              <span className="text-xs">Historial</span>
            </Link>
          </div>
        </div>
      </nav>

      {editingEventId && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
          onClick={closeEditor}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Editar evento</div>
                <div className="text-xs text-gray-400 truncate">{editingEvent?.id ?? editingEventId}</div>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={editObservedAt}
                  onChange={(e) => setEditObservedAt(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de evento</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'OBSERVATION', label: 'Observación' },
                    { value: 'MAINTENANCE', label: 'Mantenimiento' },
                    { value: 'EXCAVATION', label: 'Excavación' },
                  ] as const).map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setEditEventType(t.value)}
                      className={cn(
                        'p-2 rounded-lg border text-sm transition-colors',
                        editEventType === t.value
                          ? 'bg-blue-900 border-blue-700 text-blue-200'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el evento..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Intensidad (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editIntensity}
                    onChange={(e) => {
                      const v = e.target.value;
                      setEditIntensity(v === '' ? '' : Number(v));
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (coma)</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    placeholder="ej: limpieza, arena"
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className={cn(
                  'inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors',
                  isUpdating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                )}
                disabled={isUpdating}
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
