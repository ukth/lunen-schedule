import { schedule } from "@prisma/client";
import { useEffect, useState } from "react";
import useSWR from "swr";

export interface SchedulesResponse {
  ok: boolean;
  schedules: schedule[];
}

export default function useSchedules({ id }: { id: number | undefined }) {
  const { data, error } = useSWR<SchedulesResponse>(
    !id || typeof window === "undefined"
      ? null
      : "/api/schedule/getSchedules/" + id
  );

  const [schedules, setSchedules] = useState<schedule[]>();

  useEffect(() => {
    if (data?.ok) {
      setSchedules(
        data?.schedules.map((schedule) => ({
          ...schedule,
          startedAt: new Date(schedule.startedAt),
          finishedAt: schedule.finishedAt
            ? new Date(schedule.finishedAt)
            : null,
        }))
      );
    }
  }, [data]);

  return {
    schedules,
    loading: !data && !error,
  };
}
