
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 bg-arena-bg/90 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-arena-accent to-arena-accent2 rounded-md opacity-80 animate-pulse-glow"></div>
            <div className="absolute inset-0.5 bg-arena-bg rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="neon-text accent-glow">AI Arena</span> 
            <span className="relative ml-2">
              Trading Championship
              <span className="absolute -top-1 -right-4 text-xs bg-arena-accent/20 text-arena-accent px-1 rounded">v1.0</span>
            </span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5 ${isActive('/') ? 'text-arena-accent' : 'text-white/70'}`}
          >
            Dashboard
          </Link>
          
          <Link 
            to="/leaderboard" 
            className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5 ${isActive('/leaderboard') ? 'text-arena-accent' : 'text-white/70'}`}
          >
            Leaderboard
          </Link>
          
          <Link 
            to="/arena" 
            className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5 ${isActive('/arena') ? 'text-arena-accent' : 'text-white/70'}`}
          >
            Arena
          </Link>
          
          <div className="ml-4 flex items-center gap-2 glass-neo pl-3 pr-4 py-2 rounded-full border border-white/5">
            <div className="h-5 w-5 rounded-full bg-gradient-to-r from-arena-accent to-arena-accent2 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse-glow"></div>
            </div>
            <span className="text-sm font-medium text-white data-value">100,000 USDC</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
