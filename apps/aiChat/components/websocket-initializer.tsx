"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/hooks/use-auth-token';
import { webSocketService } from '@/lib/services/websocket';

export function WebSocketInitializer() {
  const { token, isAuthenticated } = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    // 注册导航回调
    webSocketService.registerNavigate((path) => {
      router.push(path);
    });

    if (isAuthenticated && token) {
      webSocketService.connect(token);
    } else {
      webSocketService.disconnect();
    }
    
    // Cleanup on unmount if needed, but typically we want WS to persist across page navigations
    // as long as the component (RootLayout) is mounted.
    // However, if the user logs out, the token change will trigger disconnect above.
  }, [isAuthenticated, token, router]);

  return null;
}
