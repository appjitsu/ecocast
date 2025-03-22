'use client';

import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  appName: string;
}

export const Button = ({
  children,
  className,
  appName,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={className}
      type={type}
      onClick={onClick || (() => alert(`Hello from your ${appName} app!`))}
      {...props}
    >
      {children}
    </button>
  );
};
