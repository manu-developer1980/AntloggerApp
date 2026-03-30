import { EventType } from "./db";

export interface EventFormData {
  observedAt: string;
  eventType: EventType;
  zone:
    | "forrajeo"
    | "tubo"
    | "tubo_superior"
    | "rampa"
    | "entrada"
    | "nido"
    | "puente"
    | "conexion_nido_tubo";
  action:
    | "inspeccion"
    | "exploracion"
    | "transporte"
    | "limpieza"
    | "reclutamiento"
    | "retirada"
    | "reposicion"
    | "patrulla"
    | "excavacion"
    | "ajuste_estructural"
    | "actualizacion_modulo";
  resource?:
    | "proteina"
    | "gammarus"
    | "semillas"
    | "alpiste"
    | "quinoa"
    | "bluesugar"
    | "arena"
    | "restos"
    | "bebedero";
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
