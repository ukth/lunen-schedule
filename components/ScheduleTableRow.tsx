import { KOREAN_DAY } from "@constants";
import useMutation from "@libs/client/useMutation";
import useSchedules from "@libs/client/useSchedules";
import useUser from "@libs/client/useUser";
import { analyzeSchedules, parseTimeMS } from "@libs/client/util";
import getData from "@libs/server/getData";
import { ResponseType } from "@libs/server/withHandler";
import { schedule } from "@prisma/client";
import { useRouter } from "next/router";
import { isValidElement, useEffect, useState } from "react";
import useSWR from "swr";
import Loading from "./Loading";

interface ScheduleTableRowParams {
  schedule: schedule;
}

const validateTimeString = (timeString: string) => {
  const regex = /\d{2}:\d{2}/;

  return regex.test(timeString);
};

const getTimeString = (date: Date) => {
  return date
    .toLocaleTimeString("en", {
      hour12: false,
    })
    .substring(0, 5);
};

const format2digit = (n: number) => {
  return (n >= 10 ? "" : "0") + n;
};

const ScheduleTableRow = ({ schedule }: ScheduleTableRowParams) => {
  const [editting, setEditting] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const [modifiedTime, setModifiedTime] = useState({
    startedAt: "",
    finishedAt: "",
  });

  const [
    deleteSchedule,
    { data: deleteResult, loading: deleteMutationLoading },
  ] = useMutation<ResponseType>("/api/schedule/delete");

  const [
    ModifySchedule,
    { data: ModifyResult, loading: ModifyMutationLoading },
  ] = useMutation<ResponseType>("/api/schedule/modify");

  useEffect(() => {
    if (deleteResult && deleteResult.ok) {
      alert("삭제되었습니다.");
      router.reload();
    } else if (deleteResult && !deleteResult.ok) {
      alert("삭제에 실패했습니다." + deleteResult.error);
    }
  }, [deleteResult, router]);

  useEffect(() => {
    if (ModifyResult && ModifyResult.ok) {
      alert("수정되었습니다.");
      router.reload();
    } else if (ModifyResult && !ModifyResult.ok) {
      alert("수정에 실패했습니다." + ModifyResult.error);
      setEditting(false);
    }
  }, [ModifyResult, router]);

  const removeCheck = (scheduleId: number) => {
    if (confirm("삭제하시겠습니까 ?") == true) {
      deleteSchedule({ scheduleId });
    } else {
      return;
    }
  };

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

  const onModifySubmit = () => {
    let data: { scheduleId: number; startedAt?: Date; finishedAt?: Date } = {
      scheduleId: schedule.id,
    };

    if (modifiedTime.startedAt) {
      if (!validateTimeString(modifiedTime.startedAt)) {
        alert("Invalid time format! (started time)");
        return;
      }
      data.startedAt = new Date(
        `${year}-${format2digit(month)}-${format2digit(date)}T${
          modifiedTime.startedAt
        }:00.000+09:00`
      );
    }

    if (modifiedTime.finishedAt) {
      if (!validateTimeString(modifiedTime.finishedAt)) {
        alert("Invalid time format! (finished time)");
        return;
      }
      data.finishedAt = new Date(
        `${year}-${format2digit(month)}-${format2digit(date)}T${
          modifiedTime.finishedAt
        }:00.000+09:00`
      );
    }
    if (data.startedAt || data.finishedAt) {
      ModifySchedule(data);
    } else {
      setEditting(false);
    }
  };

  return (
    <div className="flex items-center border-b-[1px] last:border-0 text-sm md:text-lg py-[2px]">
      <div className="flex-[1.2]">{`${year}/${month}/${date} (${KOREAN_DAY[day]})`}</div>
      {!editting ? (
        <div className="flex-1 pl-1">{getTimeString(schedule.startedAt)}</div>
      ) : (
        <div className="flex-1 ">
          <input
            className="border w-20 text-gray-500 focus:outline-none h-7"
            placeholder={getTimeString(schedule.startedAt)}
            onChange={(e) => {
              setModifiedTime({ ...modifiedTime, startedAt: e.target.value });
            }}
            maxLength={5}
          />
        </div>
      )}
      {!editting ? (
        <div className="flex-1 pl-1">
          {schedule.finishedAt ? getTimeString(schedule.finishedAt) : null}
        </div>
      ) : (
        <div className="flex-1 ">
          <input
            className="border w-20 text-gray-500 focus:outline-none h-7"
            placeholder={
              schedule.finishedAt ? getTimeString(schedule.finishedAt) : "18:00"
            }
            onChange={(e) => {
              setModifiedTime({ ...modifiedTime, finishedAt: e.target.value });
            }}
            maxLength={5}
          />
        </div>
      )}
      <div className="flex-1">
        {schedule.finishedAt
          ? (hour > 0 ? hour + "시간 " : "") +
            min +
            "분" +
            (schedule.modified ? "*" : "")
          : "근무중"}
      </div>
      {user?.id === schedule.userId ? (
        editting ? (
          <button
            className="w-10 text-sm flex items-center justify-center
            hover:underline text-gray-700 font-medium"
            onClick={onModifySubmit}
          >
            {modifiedTime.startedAt || modifiedTime.finishedAt
              ? "수정"
              : "취소"}
          </button>
        ) : (
          <div className="w-10 opacity-0 hover:opacity-100 flex items-center justify-center space-x-1">
            <div
              className=" hover:cursor-pointer"
              onClick={() => setEditting(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-gray-500 hover:fill-gray-700 active:scale-95"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div
              className="hover:cursor-pointer"
              onClick={() => removeCheck(schedule.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 fill-gray-500 hover:fill-gray-700 active:scale-95"
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
          </div>
        )
      ) : null}
    </div>
  );
};

export default ScheduleTableRow;
