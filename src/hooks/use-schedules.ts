import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Schedule {
  id: string;
  day: string;
  time: string;
  category: string;
  location: string;
  coach: string | null;
}

export const useSchedules = () => {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as Schedule[];
    },
  });
};
