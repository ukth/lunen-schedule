import Layout from "@components/Layout";
import Loading from "@components/Loading";
import NavBar from "@components/NavBar";
import ScheduleTable from "@components/ScheduleTable";
import { KOREAN_DAY, OFFICE_IP_ADDRESSES, TYPE_OFFICE } from "@constants";
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

  const [ipAddress, setIpAddress] = useState<string>();
  // schedule => isworking
  // ip => is Office

  useEffect(() => {
    //
    if (process.env.NODE_ENV === "development") {
      setIpAddress("221.149.114.252");
    }
    //

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
      if (!user) {
        return;
      }
      const { ok, ipAddress: clientIp } = await getData(
        "/api/getClientIpAddress"
      );
      if (ok) {
        console.log(clientIp);
        setIpAddress(clientIp);
      } else {
        alert("Invalid network access");
      }
      const data: { schedules?: schedule[] } = await getData(
        "/api/schedule/getSchedules/" + user.id
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
  }, [user]);

  const {
    hour: workedHour,
    min: workedMin,
    sec: workedSec,
  } = parseTimeMS(timeWorked);

  return (
    <Layout title="Main">
      {user ? <NavBar user={user} /> : null}
      {ipAddress && workingStatus && dataLoaded && user ? (
        <>
          <div className="h-1/3 w-full flex items-end justify-center">
            <div className="text-2xl md:text-6xl font-semibold">
              {workingStatus.isWorking
                ? timeWorked > 0
                  ? (workedHour > 0 ? workedHour + "h " : "") +
                    (workedHour > 0 || workedMin > 0 ? workedMin + "m " : "") +
                    workedSec +
                    "s"
                  : null
                : displayTime.toLocaleString("ko-KR")}
            </div>
          </div>
          <div className="h-1/6 w-full flex items-end justify-center mb-10">
            {OFFICE_IP_ADDRESSES.includes(ipAddress) ? (
              !workingStatus?.isWorking ? (
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
              )
            ) : (
              <div className="flex justify-center items-center h-8 md:text-lg">
                사무실 인터넷에 연결되어 있지 않습니다.
              </div>
            )}
          </div>
          <ScheduleTable schedules={schedules} />
        </>
      ) : (
        <Loading />
      )}
    </Layout>
  );
};

export default Home;
