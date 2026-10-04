import { auth } from '@churchflow/auth';
import { NextResponse } from 'next/server';

const PERMISSION_ROUTES: Record<string, string> = {
  '/dashboard/administration': 'manage:administrations',
  '/dashboard/permissions':    'manage:roles',
  '/dashboard/finances':       'read:finances',
  '/dashboard/graph':          'view_all:reports',
};

interface SessionUser {
  roles?: string[];
  permissions?: string[];
}

function userCanAccess(user: SessionUser | undefined, requiredPerm: string): boolean {
  if (!user) return false;
  const roles = user.roles ?? [];
  const permissions = user.permissions ?? [];
  if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) return true;

  const [action, rest] = requiredPerm.split(':');
  const [resource] = rest.split('.');
  return (
    permissions.includes(requiredPerm) ||
    permissions.includes(`${action}:${resource}.all`) ||
    permissions.includes(`${action}:${resource}.managed`) ||
    permissions.includes(`${action}:${resource}.own`) ||
    permissions.includes(`${action}:${resource}`)
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const user = session.user as SessionUser;
    for (const [route, perm] of Object.entries(PERMISSION_ROUTES)) {
      if (pathname.startsWith(route) && !userCanAccess(user, perm)) {
        return NextResponse.redirect(new URL('/dashboard?error=unauthorized', req.url));
      }
    }
  }

  if (pathname === '/login' || pathname === '/') {
    if (session) return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
};
