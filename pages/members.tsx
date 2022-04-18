import Layout from "@components/Layout";
import Loading from "@components/Loading";
import NavBar from "@components/NavBar";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import getData from "@libs/server/getData";
import { ResponseType } from "@libs/server/withHandler";
import { User } from "@prisma/client";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface LoginForm {
  username: string;
  password: string;
}

const Login: NextPage = () => {
  const router = useRouter();

  const { user, loading: userLoading } = useUser();
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      const { ok, members } = await getData("/api/user/getMembers");
      console.log(members);
      if (ok) {
        setMembers(members);
      } else {
        alert("data load failed.");
      }
    })();
  }, []);

  return (
    <Layout title="Members" whiteBackground>
      {user ? <NavBar user={user} /> : null}
      {members.length ? (
        <div className="w-2/3 mx-auto pt-80">
          {members.map((member, i) => (
            <Link key={i} href={`/schedule/${member.id}`}>
              <a className="w-40 h-10 flex items-center border-b-[1px] last:border-0 text-lg hover:underline ">
                {member.name}
              </a>
            </Link>
          ))}
        </div>
      ) : (
        <Loading />
      )}
    </Layout>
  );
};

export default Login;
