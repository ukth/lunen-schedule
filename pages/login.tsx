import Layout from "@components/Layout";
import useMutation from "@libs/client/useMutation";
import useUser from "@libs/client/useUser";
import { ResponseType } from "@libs/server/withHandler";
import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface LoginForm {
  username: string;
  password: string;
}

const Login: NextPage = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const router = useRouter();

  const { user, loading: userLoading } = useUser();

  const [login, { loading, data, error }] =
    useMutation<ResponseType>("/api/user/login");

  useEffect(() => {
    if (data?.error) {
      console.log(data.error);
      alert(data.error);
    }
    if (data?.ok) {
      router.push("/");
    }
  }, [data, router]);

  useEffect(() => {
    if (!userLoading && user) {
      router.push("/");
    }
  }, [router, userLoading, user]);

  const onValid = (validForm: LoginForm) => {
    if (loading) return;
    login(validForm);
  };

  return (
    <Layout title="Login" whiteBackground>
      <div className="pt-40 text-center">
        <div className="py-4 px-16 inline-block bg-white w-fit">
          <div className="relative h-52 w-40 mb-4 mx-auto">
            <Image
              alt="prof"
              src={"/super.png"}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <form onSubmit={handleSubmit(onValid)} className="">
            <div className="flex items-center h-10 rounded-lg mb-4 border-2 px-2 mx-auto max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
              <input
                {...register("username", { required: true })}
                className="focus:outline-none"
                placeholder="아이디"
              />
            </div>
            <div className="flex items-center h-10 rounded-lg mb-2 border-2 px-2 mx-auto max-w-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                {...register("password", { required: true })}
                type={"password"}
                className="focus:outline-none"
                placeholder="비밀번호"
              />
            </div>
            <div className="flex justify-end">
              <Link href={"/register"}>
                <a className="text-blue-500 text-sm mb-4 hover:underline">
                  회원가입
                </a>
              </Link>
            </div>
            <div className="flex mx-auto max-w-sm space-x-2">
              <button className="hover:bg-blue-300 active:scale-95 hover:text-white flex flex-1 items-center justify-center h-10 rounded-lg mb-4 border-2 px-2 mx-auto max-w-sm">
                로그인
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
