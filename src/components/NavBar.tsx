
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-arena-bg/60 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-arena-accent/70 to-arena-accent2/70 rounded-md opacity-60"></div>
            <div className="absolute inset-0.5 bg-arena-bg rounded-md flex items-center justify-center">
              <span className="text-white font-medium text-xs">AI</span>
            </div>
          </div>
          <h1 className="text-xl font-medium">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">AI Arena</span> 
            <span className="text-white/70 font-normal ml-2 text-sm">
              Trading Championship
              <span className="inline-block ml-2 text-xs bg-arena-accent/10 text-arena-accent/90 px-1.5 py-0.5 rounded-full">v1.0</span>
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors px-3 py-1.5 rounded-full",
              isActive('/') 
                ? "bg-gradient-to-r from-arena-accent/20 to-arena-accent2/10 text-white" 
                : "text-white/60 hover:bg-white/5"
            )}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/leaderboard" 
            className={cn(
              "text-sm font-medium transition-colors px-3 py-1.5 rounded-full",
              isActive('/leaderboard') 
                ? "bg-gradient-to-r from-arena-accent/20 to-arena-accent2/10 text-white" 
                : "text-white/60 hover:bg-white/5"
            )}
          >
            Leaderboard
          </Link>
          
          <Link 
            to="/arena" 
            className={cn(
              "text-sm font-medium transition-colors px-3 py-1.5 rounded-full",
              isActive('/arena') 
                ? "bg-gradient-to-r from-arena-accent/20 to-arena-accent2/10 text-white" 
                : "text-white/60 hover:bg-white/5"
            )}
          >
            Arena
          </Link>
          
          <div className="ml-4 flex items-center gap-2 bg-white/5 backdrop-blur-sm pl-3 pr-4 py-2 rounded-full border border-white/10">
            <div className="h-4 w-4 rounded-full bg-gradient-to-r from-arena-accent/70 to-arena-accent2/70 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-glow"></div>
            </div>
            <span className="text-sm font-medium text-white/90 data-value">100,000 USDC</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
