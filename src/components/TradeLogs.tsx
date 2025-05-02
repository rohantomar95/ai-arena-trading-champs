
import React, { useMemo } from 'react';

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
  
  // Group logs by round
  const logsByRound = useMemo(() => {
    const grouped: { [key: number]: TradeLog[] } = {};
    
    // Initialize all 5 rounds with empty arrays
    for (let i = 1; i <= 5; i++) {
      grouped[i] = [];
    }
    
    // Fill with actual logs
    logs.forEach(log => {
      if (grouped[log.round]) {
        grouped[log.round].push(log);
      }
    });
    
    // Sort logs within each round by timestamp (newest first)
    Object.keys(grouped).forEach(round => {
      grouped[Number(round)].sort((a, b) => b.timestamp - a.timestamp);
    });
    
    return grouped;
  }, [logs]);
  
  return (
    <div className="h-full overflow-hidden">
      <div className="overflow-y-auto h-full">
        <div className="grid gap-4 p-4">
          {/* Display each round as a separate section */}
          {Object.entries(logsByRound)
            .sort((a, b) => Number(b[0]) - Number(a[0])) // Sort rounds in descending order (latest first)
            .map(([round, roundLogs]) => (
              <div key={round} className="glass-card animate-fade-in overflow-hidden">
                <div className="p-3 border-b border-white/10 bg-arena-card/80">
                  <h3 className="font-bold text-lg">Round {round}</h3>
                </div>
                
                <div className="p-2">
                  {roundLogs.length > 0 ? (
                    <div className="grid gap-2">
                      {roundLogs.map((log) => (
                        <div 
                          key={log.id}
                          className="p-3 border border-white/5 rounded-md bg-arena-bg/30 animate-scale-in"
                          style={{ animationDuration: '0.3s' }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{log.agentName}</span>
                            <span className="text-sm text-arena-textMuted">{formatTime(log.timestamp)}</span>
                          </div>
                          
                          <div className="flex justify-between mt-1">
                            <span className={`font-medium ${
                              log.action === 'long' ? 'text-arena-green' : 
                              log.action === 'short' ? 'text-arena-red' : 'text-white'
                            }`}>
                              {log.action === 'long' ? 'OPENED LONG' : 
                               log.action === 'short' ? 'OPENED SHORT' : 'CLOSED POSITION'} @ ${log.price.toFixed(2)}
                            </span>
                            <span className="text-sm font-medium">{formatCurrency(log.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-arena-textMuted">
                      No trades in Round {round} yet
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TradeLogs;
