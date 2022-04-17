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

  const router = useRef(useRouter());

  useEffect(() => {
    (async () => {
      fetch("/api/user/getProfile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json().catch(() => {}))
        .then((data) => {
          if (data?.user) {
            setSate((prev) => ({ ...prev, user: data?.user, loading: false }));
          } else {
            router.current.push("/login");
          }
        })
        .catch((error) =>
          setSate((prev) => ({ ...prev, error, loading: false }))
        );
    })();
  }, [router]);

  return state;
}
