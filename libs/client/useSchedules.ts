import { schedule, User } from "@prisma/client";
import useSWR from "swr";

export interface SchedulesResponse {
  ok: boolean;
  schedules: schedule[];
}

export default function useSchedules({ id }: { id: number }) {
  const { data, error } = useSWR<SchedulesResponse>(
    typeof window === "undefined" || id
      ? null
      : "/api/schedule/getSchedules/" + id
  );

  return {
    schedules: data?.schedules.map((schedule) => ({
      ...schedule,
      startedAt: new Date(schedule.startedAt),
      finishedAt: schedule.finishedAt ? new Date(schedule.finishedAt) : null,
    })),
    loading: !data && !error,
  };
}
