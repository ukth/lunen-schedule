import useSchedules from "@libs/client/useSchedules";
import useUser from "@libs/client/useUser";
import { analyzeSchedules, parseTimeMS } from "@libs/client/util";
import ScheduleTableRow from "./ScheduleTableRow";

interface ScheduleTableParams {
  id?: number;
}

const ScheduleTable = ({ id }: ScheduleTableParams) => {
  const { user } = useUser();

  const { schedules } = useSchedules({ id });

  const { workDays, avgWorkTime } = analyzeSchedules(schedules ?? []);

  const { hour: avgHour, min: avgMin } = parseTimeMS(avgWorkTime);

  return schedules?.length ? (
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
        {user?.id === schedules[0].userId ? <div className="w-10" /> : null}
      </div>
      <div className="">
        {schedules.map((schedule) => (
          <ScheduleTableRow key={schedule.id} schedule={schedule} />
        ))}
      </div>
    </div>
  ) : null;
};

export default ScheduleTable;
