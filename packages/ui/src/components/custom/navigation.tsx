import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface NavigationLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationProps {
  links: NavigationLink[];
  activePath?: string;
  onLinkClick?: (href: string) => void;
  onLogout?: () => void;
  className?: string;
}

export function Navigation({
  links,
  activePath,
  onLinkClick,
  onLogout,
  className,
}: NavigationProps) {
  return (
    <nav className={twMerge('flex flex-col h-full', className)}>
      <div className="flex flex-col gap-2 flex-1">
        {links.map((link) => (
          <button
            key={link.href}
            onClick={() => onLinkClick?.(link.href)}
            className={twMerge(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
              activePath === link.href
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground',
            )}
          >
            {React.createElement(link.icon, { className: 'h-5 w-5' })}
            {link.label}
          </button>
        ))}
      </div>
      {onLogout && (
        <div className="mt-auto">
          <div className="h-px bg-gray-200 mb-2" />
          <button
            onClick={onLogout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
