import Layout from "@components/Layout";
import NavBar from "@components/NavBar";
import { KOREAN_DAY, ScheduleType, TYPE_OFFICE } from "@constants";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import { parseTimeMS } from "@libs/client/util";
import getData from "@libs/server/getData";
import { ResponseType } from "@libs/server/withHandler";
import { schedule } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [schedules, setSchedules] = useState<schedule[]>([]);

  const [arrive, { data: arriveResult, loading: arriveMutationLoading }] =
    useMutation<ResponseType>("/api/schedule/arrive");

  const [depart, { data: departResult, loading: departMutationLoading }] =
    useMutation<ResponseType>("/api/schedule/depart");

  const [workingStatus, setWorkingStatus] = useState<{
    started: number;
    isWorking: boolean;
    scheduleId: number;
  }>();
  const [isOffice, setIsOffice] = useState<boolean>();

  const [displayTime, setDisplaytime] = useState(new Date());

  const [timeWorked, setTimeWorked] = useState(0);

  const [dataLoaded, setDataLoaded] = useState(false);
  // schedule => isworking
  // ip => is Office

  useEffect(() => {
    const id = setInterval(() => {
      setDisplaytime(new Date());
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (workingStatus?.isWorking) {
        setTimeWorked(new Date().valueOf() - workingStatus.started);
      }
    }, 100);
    return () => clearInterval(id);
  }, [workingStatus]);

  useEffect(() => {
    // need to fix!!
    if (user && schedules) {
      // &&  isOffice === true or false
      setDataLoaded(true);
    }
  }, [user, userLoading, schedules, isOffice]);

  useEffect(() => {
    if (arriveResult?.ok) {
      console.log("기록되었습니다.");
      alert("기록되었습니다.");
      router.reload();
    }
  }, [router, arriveResult]);

  useEffect(() => {
    if (departResult?.ok) {
      console.log("기록되었습니다.");
      alert("기록되었습니다.");
      router.reload();
    }
  }, [router, departResult]);

  useEffect(() => {
    (async () => {
      const ip = await getData("/api/getClientIpAddress");
      // console.log(ip);
      const data: { schedules?: schedule[] } = await getData(
        "/api/schedule/getSchedules"
      );
      if (data?.schedules) {
        if (data.schedules.length === 0 || data.schedules[0].finishedAt) {
          setWorkingStatus({
            started: 0,
            isWorking: false,
            scheduleId: 0,
          });
        } else {
          setWorkingStatus({
            started: data.schedules[0].startedAt.valueOf(),
            isWorking: true,
            scheduleId: data.schedules[0].id,
          });
        }
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
    })();
  }, []);

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

  const {
    hour: workedHour,
    min: workedMin,
    sec: workedSec,
  } = parseTimeMS(timeWorked);

  return workingStatus && dataLoaded && user ? (
    <Layout>
      <NavBar user={user} />
      <div className="h-1/3 w-full flex items-end justify-center">
        <div className="text-6xl font-semibold">
          {workingStatus.isWorking
            ? workedHour + "h " + workedMin + "m " + workedSec + "s"
            : displayTime.toLocaleString("ko-KR")}
        </div>
      </div>
      <div className="h-1/6 w-full flex items-end justify-center mb-10">
        {!workingStatus?.isWorking ? (
          <button
            className="flex justify-center items-center w-20 h-8 rounded-md bg-blue-400
            text-lg text-white
            hover:ring-2 ring-offset-1 ring-blue-400"
            onClick={async () => {
              arrive({
                type: TYPE_OFFICE,
                userId: user.id,
              });
            }}
          >
            출근
          </button>
        ) : (
          <button
            className="flex justify-center items-center w-20 h-8 rounded-md bg-blue-400
            text-lg text-white
            hover:ring-2 ring-offset-1 ring-blue-400"
            onClick={() => {
              depart({
                type: TYPE_OFFICE,
                scheduleId: workingStatus.scheduleId,
              });
            }}
          >
            퇴근
          </button>
        )}
      </div>
      <div className="w-full">
        <div className="mx-auto w-2/3">
          <div className="flex justify-end space-x-2 font-medium mb-4">
            <div>근무일수 {workDays}일</div>
            <div>|</div>
            <div>
              평균 근무시간 {avgHour > 0 ? avgHour + "시간 " : ""}
              {avgMin}분
            </div>
          </div>
          <div className="flex border-b h-7 mb-1">
            <div className="flex-1">날짜</div>
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
                  className="flex border-b-[1px] last:border-0 text-lg"
                >
                  <div className="flex-1">{`${year}/${month}/${date} (${KOREAN_DAY[day]})`}</div>
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
      </div>
    </Layout>
  ) : null;
};

export default Home;
