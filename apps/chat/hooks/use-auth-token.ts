import { useSession } from "next-auth/react";
import { getAuthToken } from "@/lib/utils";
import { useEffect } from "react";

export function useAuthToken() {
  const { data: session, status } = useSession();
  
  // Prefer session token, fallback to localStorage
  const token = (session as any)?.accessToken || getAuthToken() || undefined;
  
  // Persist token to localStorage whenever it changes
  useEffect(() => {
    if ((session as any)?.accessToken) {
      localStorage.setItem('token', (session as any).accessToken);
    }
  }, [session]);
  
  return {
    token,
    status,
    isAuthenticated: !!token,
  };
}
