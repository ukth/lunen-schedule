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
import { schedule, User } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SchedulePage: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [profile, setProfile] = useState<User>();

  const [schedules, setSchedules] = useState<schedule[]>();

  useEffect(() => {
    console.log("in ID component!!");
    (async () => {
      if (!router.query.id) {
        return;
      }

      const userData: { ok: boolean; user: User } = await getData(
        "/api/user/getProfile/" + router.query.id
      );
      console.log(userData);
      if (userData?.ok) {
        setProfile(userData.user);
      } else {
        alert("user not found!");
        router.back();
      }

      const data: { schedules?: schedule[] } = await getData(
        "/api/schedule/getSchedules/" + router.query.id
      );

      console.log(data);

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
    })();
  }, [router]);

  return schedules && profile && user ? (
    <Layout>
      <NavBar user={user} />
      <div className="h-1/3 w-full flex items-end justify-center mb-20">
        <div className="text-xl md:text-3xl font-semibold">
          {profile.name}님 근무 기록표
        </div>
      </div>

      <ScheduleTable schedules={schedules} />
    </Layout>
  ) : (
    <Loading />
  );
};

export default SchedulePage;
