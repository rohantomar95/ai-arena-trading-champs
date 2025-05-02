
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-arena-bg border-b border-white/10 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-arena-accent to-arena-accent2 rounded-md opacity-80"></div>
            <div className="absolute inset-0.5 bg-arena-bg rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
          </div>
          <h1 className="text-xl font-bold">
            <span className="neon-text">AI Arena</span> Trading Championship
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-white/80 hover:text-arena-accent transition-colors">Dashboard</Link>
          <Link to="/leaderboard" className="text-white/80 hover:text-arena-accent transition-colors">Leaderboard</Link>
          <Link to="/arena" className="text-white/80 hover:text-arena-accent transition-colors">Arena</Link>
          
          <div className="ml-4 flex items-center gap-2 bg-arena-card px-4 py-1.5 rounded-full border border-white/10">
            <div className="h-3 w-3 rounded-full bg-arena-accent animate-pulse"></div>
            <span className="text-white font-medium">100,000 USDC</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
