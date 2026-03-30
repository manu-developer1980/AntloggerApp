import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConnectionStatusProps {
  status: 'connected' | 'error' | 'loading';
  message?: string;
}

export function ConnectionStatus({ status, message }: ConnectionStatusProps) {
  const configs = {
    connected: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-900',
      borderColor: 'border-green-700',
      defaultMessage: 'Conectado a Supabase'
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-900',
      borderColor: 'border-red-700',
      defaultMessage: 'Error de conexión'
    },
    loading: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900',
      borderColor: 'border-yellow-700',
      defaultMessage: 'Conectando...'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      'flex items-center gap-2 p-3 rounded-lg border',
      config.bgColor,
      config.borderColor,
      config.color
    )}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">{message || config.defaultMessage}</p>
        {status === 'error' && (
          <p className="text-xs opacity-80 mt-1">
            Verifica tus credenciales en el archivo .env
          </p>
        )}
      </div>
    </div>
  );
}