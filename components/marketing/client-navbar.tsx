'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import type { User } from '@supabase/supabase-js';

interface ClientNavbarProps {
  user: User | null;
}

export function ClientNavbar({ user }: ClientNavbarProps) {
  const { scrollY } = useScroll();
  const [isCondensed, setIsCondensed] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setIsCondensed(true);
    } else {
      setIsCondensed(false);
    }
  });

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.nav
        layout
        className={`pointer-events-auto flex items-center justify-between rounded-full transition-all duration-300 ${
          isCondensed 
            ? "w-fit gap-8 md:gap-16 px-4 py-2.5 border border-white/10 bg-white/5 backdrop-blur-[20px] backdrop-saturate-[1.8] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]" 
            : "w-full max-w-[1000px] gap-4 px-6 py-4 border border-transparent bg-transparent shadow-none"
        }`}
        transition={{ type: "spring", bounce: 0, duration: 0.7 }}
      >
        {/* Left side: Logo + Links */}
        <motion.div layout className="flex items-center gap-8 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.4)] shrink-0">
              <Activity className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-serif font-medium text-xl tracking-tighter text-white">
              Marketme
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {[
              { label: 'Features', href: '/features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Blog', href: '/blog' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Right side: Utilities */}
        <motion.div layout className="flex items-center gap-4 shrink-0">
          {!user && (
            <Link href="/login" className="hidden md:block text-sm font-medium text-white/70 hover:text-white transition-colors">
              Log in
            </Link>
          )}
          <Link href={user ? "/dashboard" : "/signup"}>
            <Button
              size="sm"
              className="bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border-0 rounded-full px-5 shadow-[0_0_20px_rgba(255,255,255,0.1)] font-medium h-9"
            >
              {user ? 'Dashboard' : 'Try free'}
            </Button>
          </Link>
        </motion.div>
      </motion.nav>
    </div>
  );
}
