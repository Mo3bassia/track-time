import { useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { mapRowToUi } from "../lib/activityHelpers";
import { useAuth } from "../context/AuthContext";

export const ACTIVITIES_PAGE_SIZE = 40;

function applyActivityFilters(query, filters, userId) {
  const {
    search = "",
    dateFrom = "",
    dateTo = "",
    timeMode = "all",
    minMinutes = null,
    maxMinutes = null,
    title = "",
  } = filters;

  query = query.eq("user_id", userId);

  const q = search.trim();
  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (title.trim()) {
    query = query.eq("title", title.trim());
  }

  if (dateFrom) {
    query = query.gte("activity_date", dateFrom);
  }
  if (dateTo) {
    query = query.lte("activity_date", dateTo);
  }

  if (timeMode === "range" || timeMode === "estimated") {
    query = query.eq("time_mode", timeMode);
  }

  if (
    minMinutes != null &&
    minMinutes !== "" &&
    !Number.isNaN(Number(minMinutes))
  ) {
    query = query.gte("duration_minutes", Number(minMinutes));
  }
  if (
    maxMinutes != null &&
    maxMinutes !== "" &&
    !Number.isNaN(Number(maxMinutes))
  ) {
    query = query.lte("duration_minutes", Number(maxMinutes));
  }

  return query;
}

/** Full list (Home / Stats) — use carefully */
export function useActivities(filters = {}) {
  const { user } = useAuth();
  const {
    search = "",
    dateFrom = "",
    dateTo = "",
    timeMode = "all",
    minMinutes = null,
    maxMinutes = null,
    title = "",
  } = filters;

  return useQuery({
    queryKey: [
      "time-activities",
      user?.id,
      search,
      dateFrom,
      dateTo,
      timeMode,
      minMinutes,
      maxMinutes,
      title,
    ],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      let query = supabase
        .from("time_activities")
        .select("*")
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false });

      query = applyActivityFilters(query, filters, user.id);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map(mapRowToUi);
    },
  });
}

export function useInfiniteActivities(filters = {}) {
  const { user } = useAuth();
  const {
    search = "",
    dateFrom = "",
    dateTo = "",
    timeMode = "all",
    minMinutes = null,
    maxMinutes = null,
    title = "",
  } = filters;

  return useInfiniteQuery({
    queryKey: [
      "time-activities-infinite",
      user?.id,
      search,
      dateFrom,
      dateTo,
      timeMode,
      minMinutes,
      maxMinutes,
      title,
    ],
    enabled: Boolean(user?.id),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = pageParam * ACTIVITIES_PAGE_SIZE;
      const to = from + ACTIVITIES_PAGE_SIZE - 1;

      let query = supabase
        .from("time_activities")
        .select("*", { count: "exact" })
        .order("activity_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      query = applyActivityFilters(query, filters, user.id);

      const { data, error, count } = await query;
      if (error) throw error;

      const items = (data ?? []).map(mapRowToUi);
      const total = count ?? null;
      const hasMore =
        items.length === ACTIVITIES_PAGE_SIZE &&
        (total == null || from + items.length < total);

      return {
        items,
        nextPage: hasMore ? pageParam + 1 : undefined,
        total,
      };
    },
    getNextPageParam: (last) => last.nextPage,
  });
}

export function useActivity(id) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["time-activities", user?.id, id],
    enabled: Boolean(user?.id && id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_activities")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapRowToUi(data) : null;
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from("time_activities")
        .insert({
          user_id: user.id,
          title: payload.title,
          description: payload.description || null,
          activity_date: payload.activityDate,
          start_time: payload.startTime || null,
          end_time: payload.endTime || null,
          duration_minutes: payload.durationMinutes,
          time_mode: payload.timeMode,
        })
        .select("*")
        .single();

      if (error) throw error;
      return mapRowToUi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-activities"] });
      queryClient.invalidateQueries({ queryKey: ["time-activities-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["time-activity-titles"] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data, error } = await supabase
        .from("time_activities")
        .update({
          title: payload.title,
          description: payload.description || null,
          activity_date: payload.activityDate,
          start_time: payload.startTime || null,
          end_time: payload.endTime || null,
          duration_minutes: payload.durationMinutes,
          time_mode: payload.timeMode,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) throw error;
      return mapRowToUi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-activities"] });
      queryClient.invalidateQueries({ queryKey: ["time-activities-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["time-activity-titles"] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("time_activities")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-activities"] });
      queryClient.invalidateQueries({ queryKey: ["time-activities-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["time-activity-titles"] });
    },
  });
}

export function useDeleteActivities() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (ids) => {
      if (!ids?.length) return;
      const { error } = await supabase
        .from("time_activities")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-activities"] });
      queryClient.invalidateQueries({ queryKey: ["time-activities-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["time-activity-titles"] });
    },
  });
}

export function usePreviousTitles() {
  const { data: activities = [] } = useActivities();
  return useMemo(
    () => [...new Set(activities.map((a) => a.title).filter(Boolean))],
    [activities],
  );
}

export function useDistinctTitles() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["time-activity-titles", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_activities")
        .select("title")
        .eq("user_id", user.id)
        .order("title");
      if (error) throw error;
      return [...new Set((data ?? []).map((r) => r.title).filter(Boolean))];
    },
  });
}
