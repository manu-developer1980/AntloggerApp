import { supabase } from "../../../lib/supabase";
import { ColonyPhase } from "../../../types/db";

export async function resolveActiveDevice(): Promise<string | null> {
  try {
    const { data, error } = (await supabase
      .from("devices")
      .select("id")
      .limit(1)
      .single()) as { data: { id: string } | null; error: any };

    if (error || !data) {
      console.warn("Error fetching active device:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.warn("Error resolving active device:", error);
    return null;
  }
}

export async function resolvePhaseForDate(
  deviceId: string,
  observedAt: string,
): Promise<string | null> {
  try {
    const observedDate = observedAt.includes('T') ? observedAt.split('T')[0] : observedAt;

    // First, try to find an active phase
    const { data: activePhase, error: activeError } = (await supabase
      .from("colony_phases")
      .select("id")
      .eq("device_id", deviceId)
      .eq("is_active", true)
      .single()) as { data: { id: string } | null; error: any };

    if (!activeError && activePhase) {
      return activePhase.id;
    }

    // If no active phase, find a phase that includes the observed date
    const { data: applicablePhase, error: rangeError } = (await supabase
      .from("colony_phases")
      .select("id")
      .eq("device_id", deviceId)
      .lte("start_date", observedDate)
      .or(`end_date.is.null,end_date.gte.${observedDate}`)
      .limit(1)
      .single()) as { data: { id: string } | null; error: any };

    if (!rangeError && applicablePhase) {
      return applicablePhase.id;
    }

    return null;
  } catch (error) {
    console.error("Error resolving phase for date:", error);
    return null;
  }
}

export async function getActivePhase(
  deviceId: string,
): Promise<ColonyPhase | null> {
  try {
    const { data, error } = await supabase
      .from("colony_phases")
      .select("*")
      .eq("device_id", deviceId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching active phase:", error);
    return null;
  }
}
