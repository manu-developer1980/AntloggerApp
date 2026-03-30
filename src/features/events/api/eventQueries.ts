import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { ColonyEvent } from "../../../types/db";
import { getTodayDateRange } from "../../../lib/dates";
import { EventFilters } from "../../../types/events";

const queryKeys = {
  events: "events",
  todaysEvents: "todays-events",
  event: (id: string) => ["event", id],
};

export function useTodaysEvents(deviceId: string | null) {
  return useQuery({
    queryKey: [queryKeys.todaysEvents, deviceId],
    queryFn: async () => {
      if (!deviceId) return [];

      const { start, end } = getTodayDateRange();

      const { data, error } = await supabase
        .from("colony_events")
        .select("*")
        .eq("device_id", deviceId)
        .gte("observed_at", start)
        .lte("observed_at", end)
        .order("observed_at", { ascending: false });

      if (error) throw error;
      return data as ColonyEvent[];
    },
    enabled: !!deviceId,
  });
}

export function useEvents(deviceId: string | null, filters?: EventFilters) {
  return useQuery({
    queryKey: [queryKeys.events, deviceId, filters],
    queryFn: async () => {
      if (!deviceId) return [];

      let query = supabase
        .from("colony_events")
        .select("*")
        .eq("device_id", deviceId);

      // Apply filters
      if (filters?.startDate) {
        query = query.gte("observed_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("observed_at", filters.endDate);
      }
      if (filters?.eventType) {
        query = query.eq("event_type", filters.eventType);
      }
      if (filters?.searchText) {
        query = query.ilike("description", `%${filters.searchText}%`);
      }

      const { data, error } = await query.order("observed_at", {
        ascending: false,
      });

      if (error) throw error;

      // Filter by tags if specified
      if (filters?.tags && filters.tags.length > 0) {
        return (data as ColonyEvent[]).filter((event) => {
          if (!event.tags) return false;
          return filters.tags!.some((tag) => event.tags!.includes(tag));
        });
      }

      return data as ColonyEvent[];
    },
    enabled: !!deviceId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<ColonyEvent, "id" | "created_at">) => {
      const { data, error } = (await supabase
        .from("colony_events")
        .insert(event as any)
        .select()
        .single()) as { data: ColonyEvent; error: any };

      if (error) throw error;
      return data as ColonyEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.todaysEvents] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.events] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...event
    }: Partial<ColonyEvent> & { id: string }) => {
      const query = supabase
        .from("colony_events")
        .update(event)
        .eq("id", id)
        .select()
        .single() as unknown as Promise<{ data: ColonyEvent; error: any }>;

      const { data, error } = await query;

      if (error) throw error;
      return data as ColonyEvent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.todaysEvents] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.events] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.event(variables.id),
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("colony_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.todaysEvents] });
      queryClient.invalidateQueries({ queryKey: [queryKeys.events] });
    },
  });
}
