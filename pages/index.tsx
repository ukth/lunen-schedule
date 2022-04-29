import { Button } from "@components/Button";
import Layout from "@components/Layout";
import Loading from "@components/Loading";
import NavBar from "@components/NavBar";
import ScheduleTable from "@components/ScheduleTable";
import { OFFICE_IP_ADDRESSES, TYPE_OFFICE, TYPE_OUTSIDE } from "@constants";
import useMutation from "@libs/client/useMutation";
import useSchedules from "@libs/client/useSchedules";
import useUser from "@libs/client/useUser";
import { parseTimeMS } from "@libs/client/util";
import { ResponseType } from "@libs/server/withHandler";
import { withSsrSession } from "@libs/server/withSession";
import type { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Home: NextPage<{ userId: number; ipAddress: string }> = ({
  userId,
  ipAddress,
}) => {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  const [arrive, { data: arriveResult, loading: arriveMutationLoading }] =
    useMutation<ResponseType>("/api/schedule/arrive");

  const [depart, { data: departResult, loading: departMutationLoading }] =
    useMutation<ResponseType>("/api/schedule/depart");

  const { schedules } = useSchedules({ id: userId });

  const [workingStatus, setWorkingStatus] = useState<{
    started: number;
    isWorking: boolean;
    scheduleId: number;
  }>();

  const [displayTime, setDisplaytime] = useState(new Date());

  const [timeWorked, setTimeWorked] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (workingStatus?.isWorking) {
        setTimeWorked(new Date().valueOf() - workingStatus.started);
      } else {
        setDisplaytime(new Date());
      }
    }, 200);
    return () => clearInterval(id);
  }, [workingStatus]);

  useEffect(() => {
    if (schedules) {
      if (schedules.length === 0 || schedules[0].finishedAt) {
        setWorkingStatus({
          started: 0,
          isWorking: false,
          scheduleId: 0,
        });
      } else {
        setWorkingStatus({
          started: schedules[0].startedAt.valueOf(),
          isWorking: true,
          scheduleId: schedules[0].id,
        });
      }
    }
  }, [schedules]);

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

  const {
    hour: workedHour,
    min: workedMin,
    sec: workedSec,
  } = parseTimeMS(timeWorked);

  return (
    <Layout title="Main">
      <NavBar user={user} />
      {workingStatus && user ? (
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
            {process.env.NODE_ENV === "development" ||
            OFFICE_IP_ADDRESSES.includes(ipAddress) ? (
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

export const getServerSideProps = withSsrSession(async function ({
  req,
}: NextPageContext) {
  return {
    props: {
      userId: req?.session.user?.id,
      ipAddress:
        req?.headers["x-real-ip"] || req?.headers["x-forwarded-for"] || "",
    },
  };
});

export default Home;
