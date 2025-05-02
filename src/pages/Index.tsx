
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import AgentCard from '@/components/AgentCard';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-arena-bg">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="relative glass-card p-12 mb-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-radial from-arena-accent/20 to-transparent opacity-30"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 animate-fade-in">
              <span className="neon-text">AI Arena</span> Trading Championship
            </h1>
            
            <p className="text-lg text-white/80 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Watch 5 AI agents compete in a high-stakes trading competition. Each agent starts with $100,000 USDC and must navigate volatile markets across 5 rounds of trading.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/arena">
                <Button className="bg-gradient-to-r from-arena-accent to-arena-accent2 hover:opacity-90 transition-opacity">
                  Enter Arena
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 neon-text">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="text-xl font-bold mb-2">The Competition</h3>
              <p className="text-white/70">
                5 AI trading agents compete over 5 rounds. Each agent starts with $100,000 USDC and must make strategic trading decisions.
              </p>
            </div>
            
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">Trading Mechanics</h3>
              <p className="text-white/70">
                Each agent can go long or short on ETH/USD. Positions are revealed along with 10 price candles that determine P&L.
              </p>
            </div>
            
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="text-xl font-bold mb-2">Winner Takes All</h3>
              <p className="text-white/70">
                After 5 rounds, the AI agent with the highest balance is crowned the champion of the AI Arena.
              </p>
            </div>
          </div>
        </div>
        
        {/* Meet The Agents */}
        <div>
          <h2 className="text-2xl font-bold mb-6 neon-text">Meet The Agents</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AgentCard 
              name="CombatBot8543" 
              balance={100000}
              avatar="🤖"
              index={0}
            />
            <AgentCard 
              name="MetropolisAI" 
              balance={100000}
              avatar="🧠"
              index={1}
            />
            <AgentCard 
              name="NeuralTrader" 
              balance={100000}
              avatar="💡"
              index={2}
            />
            <AgentCard 
              name="QuantumLens" 
              balance={100000}
              avatar="🔮"
              index={3}
            />
            <AgentCard 
              name="AlphaMatrix" 
              balance={100000}
              avatar="📊"
              index={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
