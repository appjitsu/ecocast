'use client';

import { NavigationLink, Navigation as UINavigation } from '@repo/ui';
import { Home, MessageSquare, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth/AuthContext';

export function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
      router.push('/login');
    }
  };

  const links: NavigationLink[] = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: Home,
    },
    {
      href: '/dashboard/casts',
      label: 'My Casts',
      icon: MessageSquare,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <UINavigation
      links={links}
      activePath={pathname}
      onLinkClick={(href: string) => router.push(href)}
      onLogout={handleLogout}
    />
  );
}
