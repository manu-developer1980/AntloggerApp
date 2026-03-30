import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabase";
import { LatestDeviceReading, Device, ColonyPhase } from "../../../types/db";

const queryKeys = {
  latestReading: "latest-reading",
  device: "device",
  activePhase: "active-phase",
};

export function useLatestReading(deviceId: string | null) {
  return useQuery({
    queryKey: [queryKeys.latestReading, deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      const { data, error } = await supabase
        .from("latest_device_readings")
        .select("*")
        .eq("device_id", deviceId)
        .single();

      if (error) {
        console.warn("Error fetching latest reading:", error);
        return null;
      }

      return data as LatestDeviceReading;
    },
    enabled: !!deviceId,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useDevice(deviceId: string | null) {
  return useQuery({
    queryKey: [queryKeys.device, deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("id", deviceId)
        .single();

      if (error) {
        console.warn("Error fetching device:", error);
        return null;
      }

      return data as Device;
    },
    enabled: !!deviceId,
  });
}

export function useActivePhase(deviceId: string | null) {
  return useQuery({
    queryKey: [queryKeys.activePhase, deviceId],
    queryFn: async () => {
      if (!deviceId) return null;

      const { data, error } = await supabase
        .from("colony_phases")
        .select("*")
        .eq("device_id", deviceId)
        .eq("is_active", true)
        .single();

      if (error) {
        console.warn("Error fetching active phase:", error);
        return null;
      }

      return data as ColonyPhase;
    },
    enabled: !!deviceId,
  });
}
