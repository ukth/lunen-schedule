import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface UserResponse {
  ok: boolean;
  user: User;
}

interface UseUserState {
  loading: boolean;
  user?: User;
  error?: object;
}

export default function useUser() {
  const [state, setSate] = useState<UseUserState>({
    loading: true,
    user: undefined,
    error: undefined,
  });

  const { data, error } = useSWR<UserResponse>(
    typeof window === "undefined" ? null : "/api/user/getProfile"
  );

  const router = useRouter();
  useEffect(() => {
    if (data && !data.ok) {
      router.replace("/login");
    }
  }, [data, router]);

  return { user: data?.user, loading: !data && !error };
}
