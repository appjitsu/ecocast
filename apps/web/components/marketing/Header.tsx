'use client'; // Add this directive for client-side interactivity

import {
  Button,
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui'; // Assuming Sheet components are exported from @repo/ui
import { Menu, X } from 'lucide-react'; // Import icons
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import type { MouseEvent } from 'react'; // Import MouseEvent type
import { useState } from 'react'; // Import useState
import { ModeToggle } from '../theme-toggle'; // Import ModeToggle

// Define navigation links data
const navLinks = [
  { href: '/#podcasts', label: 'Showcase', needsScrollHandler: true },
  { href: '/#features', label: 'Features', needsScrollHandler: true },
  { href: '/#pricing', label: 'Pricing', needsScrollHandler: true },
  { href: '/about', label: 'About', needsScrollHandler: false },
];

export default function Header() {
  const pathname = usePathname(); // Get current pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scroll handler
  const handleScroll = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only prevent default and smooth scroll if already on the homepage
    if (pathname === '/') {
      e.preventDefault();
      const id = href.substring(2); // Extract id from "/#id"
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      } else {
        // Fallback if element not found (should not happen often)
        window.location.href = href;
      }
    } else {
      // If not on the homepage, let NextLink handle navigation to /#id
      // The browser will handle scrolling to the ID after page load.
    }
    setIsMobileMenuOpen(false); // Close mobile menu on link click
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        {/* Left side: Logo and Desktop Nav */}
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* <Icons.logo className="h-6 w-6" /> */}
            <span className="font-bold">Ecocast</span>{' '}
            {/* Always show logo text */}
          </Link>
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden items-center gap-6 text-sm md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={
                  link.needsScrollHandler
                    ? (e) => handleScroll(e, link.href)
                    : () => setIsMobileMenuOpen(false)
                }
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side: Theme Toggle, Auth Links, Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          {/* Auth Links - Consider hiding on mobile or moving into sheet */}
          <nav className="hidden items-center sm:flex">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="default">Sign Up</Button>
            </Link>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden" // Only show on mobile
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-4/5 sm:max-w-none">
              <SheetHeader className="border-b pb-4 mb-4">
                <SheetTitle>
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {/* <Icons.logo className="h-6 w-6" /> */}
                    <span className="font-bold">Ecocast</span>
                  </Link>
                </SheetTitle>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 rounded-md bg-secondary"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={
                      link.needsScrollHandler
                        ? (e) => handleScroll(e, link.href)
                        : () => setIsMobileMenuOpen(false)
                    }
                    className="text-lg font-medium transition-colors hover:text-foreground/80 text-foreground/60 px-3 py-2 rounded-md hover:bg-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                {/* Add Auth links to mobile menu too */}
                <div className="border-t pt-4 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="default" className="w-full justify-start">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
