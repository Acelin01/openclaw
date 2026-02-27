import { useSession } from "next-auth/react";
import { getAuthToken } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useAuthToken() {
  const { data: session, status } = useSession();
  const [token, setToken] = useState<string | undefined>(undefined);
  
  // Initialize token from session or localStorage after mount
  useEffect(() => {
    const t = session?.accessToken || getAuthToken() || undefined;
    setToken(t);
  }, [session?.accessToken]);
  
  // Persist token to localStorage whenever it changes
  useEffect(() => {
    if (session?.accessToken) {
      localStorage.setItem('token', session.accessToken);
    }
  }, [session?.accessToken]);
  
  return {
    token,
    status,
    isAuthenticated: !!token,
  };
}
