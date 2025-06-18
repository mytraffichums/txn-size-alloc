import { useState, useEffect } from 'react'
import './App.css'
import { http } from 'viem'
import { createPublicClient } from 'viem'
import { monadTestnet } from 'viem/chains'

interface FireEmoji {
  id: string
  x: number
  y: number
  size: number
  opacity: number
  monBurned: string
}

function App() {
  const [fireEmojis, setFireEmojis] = useState<FireEmoji[]>([])

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  useEffect(() => {
    const unwatch = publicClient.watchBlocks({
      includeTransactions: true,
      onBlock: (block) => {
        if (block.transactions) {
          const newEmojis: FireEmoji[] = block.transactions.map((tx: any) => {
            // Calculate MON burned (gas * gasPrice converted to MON)
            const gasUsed = tx.gas || 0n
            const gasPrice = tx.gasPrice || 0n
            const monBurnedWei = gasUsed * gasPrice
            const monBurned = (Number(monBurnedWei) / 1e18).toFixed(6)
            const monBurnedNum = parseFloat(monBurned)

            // Calculate size based on MON burned (logarithmic scale for better distribution)
            // Min size: 8px, Max size: 100px
            const minSize = 8
            const maxSize = 100
            const logScale = Math.log10(Math.max(monBurnedNum * 1000000, 1)) // Scale up small values
            const normalizedScale = Math.min(logScale / 8, 1) // Normalize to 0-1 range
            const size = minSize + (maxSize - minSize) * normalizedScale

            return {
              id: tx.hash,
              x: Math.random() * (window.innerWidth - 100),
              y: Math.random() * (window.innerHeight - 100),
              size: size,
              opacity: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
              monBurned,
            }
          })

          // Add new emojis and keep only the latest 50 to prevent too many
          setFireEmojis(prev => [...newEmojis, ...prev].slice(0, 50))
        }
      },
    })

    return () => unwatch()
  }, [])



  return (
    <div className="blank-page">
      <div className="header">
        <h1>🔥 MON Burner 🔥</h1>
        <div className="info-box">
          <p>
            <strong>Live Monad Testnet Transaction Visualizer</strong><br/>
            Each fire emoji represents a transaction burning MON tokens.<br/>
            <strong>Size = Amount of MON burned</strong> | Click any emoji to view on explorer
          </p>
        </div>
      </div>

      <div className="history-box">
        <h3>🔥 Transaction History</h3>
        <div className="history-list">
          {fireEmojis.length === 0 ? (
            <p className="no-transactions">Waiting for transactions...</p>
          ) : (
            fireEmojis.map((emoji) => (
              <div 
                key={emoji.id} 
                className="history-item"
                onClick={() => window.open(`https://testnet.monadexplorer.com/tx/${emoji.id}`, '_blank')}
              >
                <div className="tx-info">
                  <span className="tx-hash">{emoji.id.slice(0, 10)}...{emoji.id.slice(-6)}</span>
                </div>
                <div className="tx-burn">
                  <span className="mon-burned">{emoji.monBurned} MON</span>
                  <span className="fire-size" style={{ fontSize: `${Math.min(emoji.size / 20, 20)}px` }}>🔥</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {fireEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className="fire-emoji"
          style={{
            left: `${emoji.x}px`,
            top: `${emoji.y}px`,
            fontSize: `${emoji.size}px`,
            opacity: emoji.opacity,
          }}
          title={`MON Burned: ${emoji.monBurned}\nTx: ${emoji.id.slice(0, 10)}...\nClick to view on explorer`}
          onClick={() => window.open(`https://testnet.monadexplorer.com/tx/${emoji.id}`, '_blank')}
        >
          🔥
        </div>
      ))}

      <style>{`
        .blank-page {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: black;
          overflow: hidden;
        }
        
        .header {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          text-align: center;
        }
        
        .header h1 {
          color: #ff6b35;
          font-size: 2.5rem;
          margin: 0 0 15px 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
          font-family: 'Arial', sans-serif;
        }
        
        .info-box {
          background: rgba(0,0,0,0.8);
          border: 2px solid #ff6b35;
          padding: 15px 20px;
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          max-width: 500px;
          backdrop-filter: blur(10px);
        }
        
        .info-box strong {
          color: #ff6b35;
        }

        .history-box {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 350px;
          max-height: 500px;
          background: rgba(0,0,0,0.7);
          border: 2px solid #ff6b35;
          border-radius: 10px;
          padding: 15px;
          z-index: 1000;
          backdrop-filter: blur(10px);
          color: white;
        }

        .history-box h3 {
          color: #ff6b35;
          margin: 0 0 15px 0;
          font-size: 1.2rem;
          text-align: center;
        }

        .history-list {
          max-height: 400px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #ff6b35 transparent;
        }

        .history-list::-webkit-scrollbar {
          width: 6px;
        }

        .history-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .history-list::-webkit-scrollbar-thumb {
          background: #ff6b35;
          border-radius: 3px;
        }

        .history-item {
          padding: 8px 12px;
          margin-bottom: 8px;
          background: rgba(255,107,53,0.1);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .history-item:hover {
          background: rgba(255,107,53,0.2);
          transform: translateX(5px);
        }

        .tx-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .tx-hash {
          font-family: monospace;
          font-size: 0.85rem;
          color: #ff6b35;
        }

        .tx-burn {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mon-burned {
          font-size: 0.9rem;
          color: white;
          font-weight: bold;
        }

        .fire-size {
          margin-left: 8px;
        }

        .no-transactions {
          text-align: center;
          color: #ccc;
          font-style: italic;
          padding: 20px 0;
        }
        
        .fire-emoji {
          position: absolute;
          animation: fadeInOut 8s ease-in-out infinite;
          cursor: pointer;
          user-select: none;
          filter: drop-shadow(0 0 10px rgba(255,107,53,0.5));
        }
        
        @keyframes fadeInOut {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotate(0deg); 
          }
          25% { 
            opacity: 1; 
            transform: scale(1) rotate(90deg); 
          }
          75% { 
            opacity: 1; 
            transform: scale(1) rotate(270deg); 
          }
          100% { 
            opacity: 0; 
            transform: scale(0.5) rotate(360deg); 
          }
        }
        
        .fire-emoji:hover {
          transform: scale(1.2);
          transition: transform 0.2s ease;
          filter: drop-shadow(0 0 20px rgba(255,107,53,0.8));
        }
      `}</style>
    </div>
  )
}

export default App
