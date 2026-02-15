'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
];

export function MarketingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm dark:bg-slate-900/80'
          : 'bg-transparent'
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo href="/" />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/quotecraft/quotecraft"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-900 dark:text-white" />
          ) : (
            <Menu className="h-6 w-6 text-slate-900 dark:text-white" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/quotecraft/quotecraft"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium py-2"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
            <div className="pt-4 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
