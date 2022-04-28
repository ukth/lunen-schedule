import { Button } from "@components/Button";
import Layout from "@components/Layout";
import Loading from "@components/Loading";
import NavBar from "@components/NavBar";
import ScheduleTable from "@components/ScheduleTable";
import { OFFICE_IP_ADDRESSES, TYPE_OFFICE, TYPE_OUTSIDE } from "@constants";
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

  const [displayTime, setDisplaytime] = useState(new Date());

  const [timeWorked, setTimeWorked] = useState(0);

  const [dataLoaded, setDataLoaded] = useState(false);

  const [ipAddress, setIpAddress] = useState<string>();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setIpAddress("221.149.114.252");
    }

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
    if (user && schedules) {
      setDataLoaded(true);
    }
  }, [user, userLoading, schedules]);

  useEffect(() => {
    if (arriveResult?.ok) {
      console.log("기록되었습니다.");
      alert("기록되었습니다.");
      router.reload();
    } else if (arriveResult?.ok === false) {
      console.log(arriveResult.error);
      alert(arriveResult.error);
    }
  }, [router, arriveResult]);

  useEffect(() => {
    if (departResult?.ok) {
      console.log("기록되었습니다.");
      alert("기록되었습니다.");
      router.reload();
    } else if (departResult?.ok === false) {
      console.log(departResult.error);
      alert(departResult.error);
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
      <NavBar user={user} />
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
                <Button
                  onClick={async () => {
                    arrive({
                      type: TYPE_OFFICE,
                      userId: user.id,
                    });
                  }}
                >
                  출근
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    depart({
                      type: TYPE_OFFICE,
                      scheduleId: workingStatus.scheduleId,
                    });
                  }}
                >
                  퇴근
                </Button>
              )
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex justify-center items-center h-8 md:text-lg">
                  사무실 인터넷에 연결되어 있지 않습니다.
                </div>
                {!workingStatus?.isWorking ? (
                  <Button
                    onClick={async () => {
                      arrive({
                        type: TYPE_OUTSIDE,
                        userId: user.id,
                      });
                    }}
                  >
                    외근/출장
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      depart({
                        type: TYPE_OUTSIDE,
                        scheduleId: workingStatus.scheduleId,
                      });
                    }}
                  >
                    퇴근(외근/출장)
                  </Button>
                )}
              </div>
            )}
          </div>
          <ScheduleTable id={user.id} />
        </>
      ) : (
        <Loading />
      )}
    </Layout>
  );
};

export default Home;
