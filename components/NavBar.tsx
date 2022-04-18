import getData from "@libs/server/getData";
import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

interface NavbarProps {
  user: User;
}

const NavBar = ({ user }: NavbarProps) => {
  const router = useRouter();

  const logout = async () => {
    const res = await getData("/api/user/logout");
    if (res) {
      router.push("/login");
    }
  };

  return (
    <div className="fixed top-0 flex justify-between w-full p-4 h-16 items-center bg-white z-10 ">
      <div className="flex items-center space-x-4">
        <div
          onClick={() => {
            router.push("/");
          }}
          className="relative h-12 w-10 mb-4 my-auto mt-5 hover:cursor-pointer"
        >
          <Image
            alt="prof"
            src={"/super.png"}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div
          onClick={() => {
            router.push("/members");
          }}
          className="text-2xl font-medium text-gray-800  hover:cursor-pointer"
        >
          Lunen
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div>안녕하세요, {user.name}님!</div>
        <button
          className="w-20 h-6 bg-slate-400 rounded-md text-sm text-white font-semibold
          hover:ring-2 ring-slate-500 ring-offset-1"
          onClick={logout}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default NavBar;
