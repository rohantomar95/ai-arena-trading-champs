
import React from 'react';

interface TradeLog {
  id: string;
  agentId: string;
  agentName: string;
  action: 'long' | 'short' | 'close';
  amount: number;
  timestamp: number;
  price: number;
  round: number;
}

interface TradeLogsProps {
  logs: TradeLog[];
}

const TradeLogs: React.FC<TradeLogsProps> = ({ logs }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Sort by timestamp descending (newest first)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);
  
  return (
    <div className="glass-card h-full overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-bold">Trade Logs</h2>
      </div>
      
      <div className="p-2 overflow-y-auto h-[calc(100%-60px)]">
        {sortedLogs.map((log) => (
          <div 
            key={log.id}
            className="p-3 border-b border-white/5 animate-scale-in"
            style={{ animationDuration: '0.3s' }}
          >
            <div className="flex justify-between">
              <span className="font-medium text-white">{log.agentName}</span>
              <span className="text-sm text-arena-textMuted">{formatTime(log.timestamp)}</span>
            </div>
            
            <div className="flex justify-between mt-1">
              <span className={`text-sm ${
                log.action === 'long' ? 'text-arena-green' : 
                log.action === 'short' ? 'text-arena-red' : 'text-white'
              }`}>
                {log.action === 'long' ? 'OPENED LONG' : 
                 log.action === 'short' ? 'OPENED SHORT' : 'CLOSED POSITION'} @ ${log.price.toFixed(2)}
              </span>
              <span className="text-sm font-medium">{formatCurrency(log.amount)}</span>
            </div>
            
            <div className="text-xs text-arena-textMuted mt-1">
              Round {log.round}
            </div>
          </div>
        ))}
        
        {logs.length === 0 && (
          <div className="p-4 text-center text-arena-textMuted">
            No trades yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeLogs;
