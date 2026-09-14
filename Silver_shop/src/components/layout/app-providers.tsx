import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { tokenStorage } from '@/lib/storage/token-storage';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false);

  useEffect(() => {
    // Restore session on app startup (only run once)
    if (!hasCompletedInitialLoad) {
      setHasCompletedInitialLoad(true);

      tokenStorage.getAccess().then((accessToken) => {
        if (accessToken) {
          // Access token exists — try to restore full session
          tokenStorage.getRefresh().then((refreshToken) => {
            if (refreshToken) {
              useAppStore.getState().restoreSession();
            } else {
              // Has access token but no refresh token → clear and unauthenticate
              useAppStore.getState().logout();
            }
          });
        } else {
          // No access token → unauthenticate
          useAppStore.getState().logout();
        }
      });
    }
  }, [hasCompletedInitialLoad]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}