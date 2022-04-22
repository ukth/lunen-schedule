import Layout from "@components/Layout";
import Loading from "@components/Loading";
import NavBar from "@components/NavBar";
import ScheduleTable from "@components/ScheduleTable";
import useUser, { UserResponse } from "@libs/client/useUser";
import { schedule } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

export interface SchedulesResponse {
  ok: boolean;
  schedules: schedule[];
}

const SchedulePage: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();

  const { data: userData, error } = useSWR<UserResponse>(
    typeof window === "undefined" || !router.query.id
      ? null
      : "/api/user/getProfile/" + router.query.id
  );

  useEffect(() => {
    if (userData && !userData.ok) {
      alert("user not  found!");
      router.back();
    }
  }, [router, userData]);

  return (
    <Layout title="Schedule">
      {user ? <NavBar user={user} /> : null}
      {userData?.user ? (
        <>
          {userData?.user ? (
            <div className="h-1/3 w-full flex items-end justify-center mb-20">
              <div className="text-xl md:text-3xl font-semibold">
                {userData.user.name}님 근무 기록표
              </div>
            </div>
          ) : null}

          <ScheduleTable id={router.query.id ? +router.query.id : undefined} />
        </>
      ) : (
        <Loading />
      )}
    </Layout>
  );
};

export default SchedulePage;
