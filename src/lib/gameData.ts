
// Mock data for the trading game

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  initialBalance: number;
  position: 'long' | 'short' | null;
  positionSize: number;
  pnlPercent: number;
}

export interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  revealed: boolean;
}

export interface TradeLog {
  id: string;
  agentId: string;
  agentName: string;
  action: 'long' | 'short' | 'close';
  amount: number;
  timestamp: number;
  price: number;
  round: number;
}

// Generate random price data
const generateCandles = (count: number, basePrice: number): CandleData[] => {
  let lastClose = basePrice;
  const volatility = basePrice * 0.02; // 2% volatility
  
  return Array.from({ length: count }, (_, i) => {
    const change = (Math.random() - 0.5) * volatility;
    const open = lastClose;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    
    lastClose = close;
    
    return {
      open,
      high,
      low,
      close,
      volume: Math.random() * 1000 + 500,
      timestamp: Date.now() - (count - i) * 60000, // 1 minute candles
      revealed: false
    };
  });
};

// Initial agents data
export const initialAgents: Agent[] = [
  {
    id: 'agent1',
    name: 'CombatBot8543',
    avatar: '🤖',
    balance: 100000,
    initialBalance: 100000,
    position: null,
    positionSize: 0,
    pnlPercent: 0
  },
  {
    id: 'agent2',
    name: 'MetropolisAI',
    avatar: '🧠',
    balance: 100000,
    initialBalance: 100000,
    position: null,
    positionSize: 0,
    pnlPercent: 0
  },
  {
    id: 'agent3',
    name: 'NeuralTrader',
    avatar: '💡',
    balance: 100000,
    initialBalance: 100000,
    position: null,
    positionSize: 0,
    pnlPercent: 0
  },
  {
    id: 'agent4',
    name: 'QuantumLens',
    avatar: '🔮',
    balance: 100000,
    initialBalance: 100000,
    position: null,
    positionSize: 0,
    pnlPercent: 0
  },
  {
    id: 'agent5',
    name: 'AlphaMatrix',
    avatar: '📊',
    balance: 100000,
    initialBalance: 100000,
    position: null,
    positionSize: 0,
    pnlPercent: 0
  }
];

// Initial candles for round 1
export const initialCandles = generateCandles(10, 2200);

export const generateInitialTrades = (agents: Agent[], round: number, basePrice: number): TradeLog[] => {
  return agents.map(agent => {
    const isLong = Math.random() > 0.5;
    const positionSize = Math.floor(agent.balance * (Math.random() * 0.5 + 0.1)); // 10-60% of balance
    
    return {
      id: `trade-${agent.id}-round${round}`,
      agentId: agent.id,
      agentName: agent.name,
      action: isLong ? 'long' : 'short',
      amount: positionSize,
      timestamp: Date.now(),
      price: basePrice,
      round
    };
  });
};

export const updateAgentsWithTrades = (
  agents: Agent[], 
  trades: TradeLog[]
): Agent[] => {
  return agents.map(agent => {
    const trade = trades.find(t => t.agentId === agent.id);
    if (!trade) return agent;
    
    return {
      ...agent,
      position: trade.action as 'long' | 'short',
      positionSize: trade.amount
    };
  });
};

export const calculatePnL = (
  agents: Agent[], 
  candle: CandleData, 
  previousCandle: CandleData | null
): Agent[] => {
  if (!previousCandle) return agents;
  
  const priceChange = (candle.close - previousCandle.close) / previousCandle.close;
  
  return agents.map(agent => {
    if (!agent.position || agent.positionSize === 0) return agent;
    
    const leverage = 1; // No leverage in this game
    const pnlMultiplier = agent.position === 'long' ? priceChange : -priceChange;
    const pnl = agent.positionSize * pnlMultiplier * leverage;
    const newBalance = agent.balance + pnl;
    const pnlPercent = (newBalance - agent.initialBalance) / agent.initialBalance * 100;
    
    return {
      ...agent,
      balance: newBalance,
      pnlPercent
    };
  });
};

export const closePositions = (agents: Agent[]): Agent[] => {
  return agents.map(agent => ({
    ...agent,
    position: null,
    positionSize: 0
  }));
};

// Generate random candles for different price ranges
export const generateCandlesForRound = (round: number): CandleData[] => {
  let basePrice: number;
  
  switch(round) {
    case 1:
      basePrice = 2200; // ETH price range
      break;
    case 2:
      basePrice = 2250;
      break;
    case 3:
      basePrice = 2220;
      break;
    case 4:
      basePrice = 2180;
      break;
    case 5:
      basePrice = 2210;
      break;
    default:
      basePrice = 2200;
  }
  
  return generateCandles(10, basePrice);
};
