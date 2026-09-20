import { useState } from 'react';

/**
 * Shared auth-form flow for Login and Register:
 * submit guard + server error + delayed navigation.
 * One logic in one place — both forms behave identically.
 */
export function useAuthSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const submit = async (task: () => Promise<void>, fallbackMessage: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setServerError(null);
    try {
      await task();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigate = (go: () => void) => {
    if (isNavigating) return;
    setIsNavigating(true);
    setTimeout(() => go(), 400);
  };

  return { isSubmitting, serverError, isNavigating, submit, navigate };
}
