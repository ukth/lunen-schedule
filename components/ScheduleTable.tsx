import { KOREAN_DAY } from "@constants";
import useMutation from "@libs/client/useMutation";
import useSchedules from "@libs/client/useSchedules";
import useUser from "@libs/client/useUser";
import { analyzeSchedules, parseTimeMS } from "@libs/client/util";
import getData from "@libs/server/getData";
import { ResponseType } from "@libs/server/withHandler";
import { schedule } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Loading from "./Loading";

interface ScheduleTableParams {
  id: number | undefined;
}

interface SchedulesResponse {
  ok: boolean;
  schedules: schedule[];
}

const ScheduleTable = ({ id }: ScheduleTableParams) => {
  // const { schedules, loading } = useSchedules({ id });
  const [schedules, setSchedules] = useState<schedule[]>([]);
  const router = useRouter();
  const { user } = useUser();

  const [
    deleteSchedule,
    { data: deleteResult, loading: deleteMutationLoading },
  ] = useMutation<ResponseType>("/api/schedule/delete");

  const { data } = useSWR<SchedulesResponse>(
    typeof window === "undefined"
      ? null
      : id
      ? "/api/schedule/getSchedules/" + id
      : null
  );

  useEffect(() => {
    if (data?.schedules) {
      setSchedules(
        data.schedules.map((schedule) => ({
          ...schedule,
          startedAt: new Date(schedule.startedAt),
          finishedAt: schedule.finishedAt
            ? new Date(schedule.finishedAt)
            : null,
        }))
      );
    }
  }, [data]);

  useEffect(() => {
    if (deleteResult && deleteResult.ok) {
      alert("삭제되었습니다.");
      router.reload();
    } else if (deleteResult && !deleteResult.ok) {
      alert("삭제에 실패했습니다." + deleteResult.error);
    }
  }, [deleteResult, router]);

  if (!schedules) return null;

  const { workDays, avgWorkTime } = analyzeSchedules(schedules);

  const { hour: avgHour, min: avgMin } = parseTimeMS(avgWorkTime);

  const removeCheck = (scheduleId: number) => {
    if (confirm("삭제하시겠습니까 ?") == true) {
      deleteSchedule({ scheduleId });
    } else {
      return;
    }
  };

  return schedules.length ? (
    <div className="w-full md:w-2/3 md:mx-auto bg-white rounded-xl py-3 px-4 shadow-md mb-20">
      <div className="flex justify-end space-x-2 font-medium mb-4">
        <div>근무일수 {workDays}일</div>
        <div>|</div>
        <div>
          평균 근무시간 {avgHour > 0 ? avgHour + "시간 " : ""}
          {avgMin}분
        </div>
      </div>
      <div className="flex border-b h-7 text-sm md:text-lg font-semibold">
        <div className="flex-[1.2]">날짜</div>
        <div className="flex-1">출근</div>
        <div className="flex-1">퇴근</div>
        <div className="flex-1">근무시간</div>
        {user?.id === schedules[0].userId ? <div className="w-5" /> : null}
      </div>
      <div className="">
        {schedules.map((schedule, i) => {
          let year = schedule.startedAt.getFullYear(); // 년도
          let month = schedule.startedAt.getMonth() + 1; // 월
          let date = schedule.startedAt.getDate(); // 날짜
          let day = schedule.startedAt.getDay(); // 요일

          let hour = 0,
            min = 0;

          const workTime = schedule.finishedAt
            ? schedule.finishedAt.valueOf() - schedule.startedAt.valueOf()
            : 0;

          if (workTime) {
            const { hour: h, min: m } = parseTimeMS(workTime);
            hour = h;
            min = m;
          }

          return (
            <div
              key={i}
              className="flex items-center border-b-[1px] last:border-0 text-sm md:text-lg py-[2px]"
            >
              <div className="flex-[1.2]">{`${year}/${month}/${date} (${KOREAN_DAY[day]})`}</div>
              <div className="flex-1">
                {schedule.startedAt
                  .toLocaleTimeString("en", {
                    hour12: false,
                  })
                  .substring(0, 5)}
              </div>
              <div className="flex-1">
                {schedule.finishedAt
                  ? schedule.finishedAt
                      .toLocaleTimeString("en", {
                        hour12: false,
                      })
                      .substring(0, 5)
                  : null}
              </div>
              <div className="flex-1">
                {schedule.finishedAt
                  ? (hour > 0 ? hour + "시간 " : "") + min + "분"
                  : "근무중"}
              </div>
              {user?.id === schedules[0].userId ? (
                <div
                  className="w-5 hover:cursor-pointer"
                  onClick={() => removeCheck(schedule.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 fill-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
};

export default ScheduleTable;
