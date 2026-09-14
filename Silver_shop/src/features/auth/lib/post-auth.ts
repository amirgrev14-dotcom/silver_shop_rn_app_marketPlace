import type { AuthUser, BackendRole } from '@/features/auth/types';
import type { MarketplaceMode } from '@/features/marketplace/types';

export type PostAuthDestination =
  | { pathname: '/verify-email'; params: { email: string } }
  | null;

/**
 * Single decision point for post-auth routing.
 *
 * Used by BOTH LoginForm and RegisterForm right after a successful
 * response, so the "where to go next" logic lives in exactly one place:
 *   - unverified user  → `/verify-email?email=…`
 *   - verified user    → null (stay; the marketplace gate on `/`
 *                        switches to SILVER home by itself)
 */
export function getPostAuthDestination(user: AuthUser): PostAuthDestination {
  if (!user.isVerifiedEmail) {
    return { pathname: '/verify-email', params: { email: user.email } };
  }
  return null;
}

/**
 * Backend role → app tab mode. The DB role is the source of truth at
 * login/register; the profile switcher only changes the local view.
 * SUPER_ADMIN has no admin UI yet, so it gets seller tabs.
 */
export function roleToMode(role: BackendRole): MarketplaceMode {
  return role === 'BUYER' ? 'buyer' : 'seller';
}
