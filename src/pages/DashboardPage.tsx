import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, History, Thermometer, Droplets, Gauge, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resolveActiveDevice } from '../features/phases/utils/phaseUtils';
import { getActivePhase } from '../features/phases/utils/phaseUtils';
import { useLatestReading } from '../features/readings/api/readingQueries';
import { useDevice } from '../features/readings/api/readingQueries';
import { useActivePhase } from '../features/readings/api/readingQueries';
import { useTodaysEvents } from '../features/events/api/eventQueries';
import { formatTime } from '../lib/dates';
import { formatTemperature, formatHumidity, formatPressure } from '../lib/utils';
import { cn } from '../lib/utils';

export function DashboardPage() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'loading'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Check Supabase credentials and fetch active device on mount
  useEffect(() => {
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseAnonKey || supabaseAnonKey === 'your_anon_key_here' || !supabaseUrl) {
      setConnectionStatus('error');
      setErrorMessage('Por favor configura tus credenciales de Supabase en el archivo .env');
      return;
    }
    
    setConnectionStatus('loading');
    resolveActiveDevice()
      .then((id) => {
        if (id) {
          setDeviceId(id);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
          setErrorMessage('No se encontró ningún dispositivo activo en la base de datos');
        }
      })
      .catch((error) => {
        console.error('Error fetching active device:', error);
        setConnectionStatus('error');
        setErrorMessage('Error al conectar con Supabase. Verifica tus credenciales.');
      });
  }, []);
  
  const { data: device } = useDevice(deviceId);
  const { data: activePhase } = useActivePhase(deviceId);
  const { data: latestReading } = useLatestReading(deviceId);
  const { data: todaysEvents } = useTodaysEvents(deviceId);
  
  const lastReadingTime = latestReading?.created_at 
    ? formatTime(latestReading.created_at) 
    : '--:--';
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-white">AntLogger</h1>
          <div className="mt-1 text-sm text-gray-400">
            {device?.name || 'Cargando dispositivo...'}
            {activePhase && (
              <span className="ml-2 px-2 py-1 bg-blue-600 text-blue-100 rounded-full text-xs">
                {activePhase.name}
              </span>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Connection Status */}
        {connectionStatus === 'error' && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-200 font-medium">Error de Conexión</p>
                <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
                <p className="text-red-400 text-xs mt-2">
                  Asegúrate de configurar VITE_SUPABASE_ANON_KEY en tu archivo .env
                </p>
              </div>
            </div>
          </div>
        )}
        
        {connectionStatus === 'loading' && (
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
              <p className="text-yellow-200">Conectando a Supabase...</p>
            </div>
          </div>
        )}
        
        {/* Current Readings Card */}
        {connectionStatus === 'connected' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Condiciones Actuales</h2>
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {lastReadingTime}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Thermometer className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-400">
                  {formatTemperature(latestReading?.temperature)}
                </div>
                <div className="text-xs text-gray-400">Temperatura</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatHumidity(latestReading?.humidity)}
                </div>
                <div className="text-xs text-gray-400">Humedad</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Gauge className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {formatPressure(latestReading?.pressure)}
                </div>
                <div className="text-xs text-gray-400">Presión</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Today's Events */}
        {connectionStatus === 'connected' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Eventos de Hoy</h2>
              <span className="text-sm text-gray-400">
                {todaysEvents?.length || 0} eventos
              </span>
            </div>
            
            {todaysEvents && todaysEvents.length > 0 ? (
              <div className="space-y-3">
                {todaysEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            event.event_type === 'OBSERVATION' && 'bg-green-900 text-green-200',
                            event.event_type === 'MAINTENANCE' && 'bg-blue-900 text-blue-200',
                            event.event_type === 'EXCAVATION' && 'bg-orange-900 text-orange-200'
                          )}>
                            {event.event_type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(event.observed_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-200">{event.description}</p>
                        {event.intensity && (
                          <div className="flex items-center mt-2">
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
                    </div>
                  </div>
                ))}
                
                {todaysEvents.length > 5 && (
                  <Link to="/history" className="block text-center text-blue-400 hover:text-blue-300 text-sm py-2">
                    Ver todos los eventos de hoy →
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-lg mb-2">No hay eventos hoy</div>
                <div className="text-sm">Registra tu primer evento para comenzar</div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Link
          to="/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around py-2">
            <Link
              to="/"
              className="flex flex-col items-center py-2 px-4 text-blue-400"
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
              className="flex flex-col items-center py-2 px-4 text-gray-400 hover:text-white"
            >
              <History className="w-6 h-6 mb-1" />
              <span className="text-xs">Historial</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}