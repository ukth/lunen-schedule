import { KOREAN_DAY } from "@constants";
import { parseTimeMS } from "@libs/client/util";
import { schedule } from "@prisma/client";

interface ScheduleTableParams {
  schedules: schedule[];
}
const ScheduleTable = ({ schedules }: ScheduleTableParams) => {
  const reducer = (prev: number, current: schedule) =>
    prev + (current.finishedAt?.valueOf() ?? 0) - current.startedAt.valueOf();

  const workDays = schedules[0]
    ? schedules[0]?.finishedAt
      ? schedules.length
      : schedules.length - 1
    : 0;

  const workTime = schedules[0]
    ? schedules[0].finishedAt
      ? schedules.reduce(reducer, 0)
      : schedules.slice(1).reduce(reducer, 0)
    : 0;

  const { hour: avgHour, min: avgMin } = parseTimeMS(
    workDays > 0 ? workTime / workDays : 0
  );

  return (
    <div className="w-full md:w-2/3 md:mx-auto bg-white rounded-xl py-3 px-4 shadow-md ">
      <div className="flex justify-end space-x-2 font-medium mb-4">
        <div>근무일수 {workDays}일</div>
        <div>|</div>
        <div>
          평균 근무시간 {avgHour > 0 ? avgHour + "시간 " : ""}
          {avgMin}분
        </div>
      </div>
      <div className="flex border-b h-7 mb-1">
        <div className="flex-[1.2]">날짜</div>
        <div className="flex-1">출근</div>
        <div className="flex-1">퇴근</div>
        <div className="flex-1">근무시간</div>
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
              className="flex border-b-[1px] last:border-0 text-sm md:text-lg"
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleTable;
