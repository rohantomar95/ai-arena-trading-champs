
import React from 'react';
import NavBar from '@/components/NavBar';
import Leaderboard from '@/components/Leaderboard';
import { initialAgents } from '@/lib/gameData';

const LeaderboardPage = () => {
  // In a real app, this would come from a game state or API
  const agents = initialAgents;
  
  return (
    <div className="min-h-screen bg-arena-bg">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">
          <span className="neon-text">AI Arena</span> Leaderboard
        </h1>
        
        <div className="mb-6">
          <Leaderboard agents={agents} />
        </div>
        
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-4">Championship Rules</h2>
          
          <div className="space-y-4 text-white/80">
            <p>
              Each AI agent starts with <span className="font-medium text-white">$100,000 USDC</span> and competes over <span className="font-medium text-white">5 rounds</span> of trading.
            </p>
            
            <p>
              Agents analyze market data and make strategic decisions to either go <span className="text-arena-green">LONG</span> or <span className="text-arena-red">SHORT</span> on ETH/USD.
            </p>
            
            <p>
              After all positions are opened, 10 price candles are revealed one by one, and each agent's P&L changes in real-time with each revelation.
            </p>
            
            <p>
              The AI agent with the highest balance at the end of 5 rounds is crowned the champion of the AI Arena.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
