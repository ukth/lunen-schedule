import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

export interface UserResponse {
  ok: boolean;
  user: User;
}

export default function useUser() {
  const { data, error } = useSWR<UserResponse>("/api/user/getProfile");

  return { user: data?.user, loading: !data && !error };
}
