import { useState, useEffect } from 'react'
import './App.css'
import { http } from 'viem'
import { createPublicClient } from 'viem'
import { monadTestnet } from 'viem/chains'

function App() {
  const [blockDetails, setBlockDetails] = useState<any>(null)

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  useEffect(() => {
    const unwatch = publicClient.watchBlocks({
      includeTransactions: true,
      onBlock: (block) => {
        setBlockDetails(block)
      },
    })

    return () => unwatch()
  }, [])

  const calculateGasMetrics = (block: any) => {
    if (!block?.transactions) return null

    const totalGasUsed = block.gasUsed
    const gasLimit = block.gasLimit
    const blockGasUsagePercent = Number((totalGasUsed * 100n) / gasLimit)

    return {
      totalGasUsed,
      gasLimit,
      blockGasUsagePercent,
    }
  }

  const metrics = blockDetails ? calculateGasMetrics(blockDetails) : null

  return (
    <div className="container">
      <h2>Latest Block: {blockDetails?.number?.toString()}</h2>
      
      {metrics && (
        <div className="gas-metrics">
          <h3>Gas Metrics</h3>
          <p>Block Gas Limit: {metrics.gasLimit.toString()} gas</p>
          <p>Total Gas Used: {metrics.totalGasUsed.toString()} gas ({metrics.blockGasUsagePercent.toFixed(2)}%)</p>
          <p>Number of Transactions: {blockDetails.transactions.length}</p>
          
          <h3>Top 10 Transactions by Gas Usage</h3>
          <div className="transactions">
            {[...blockDetails.transactions]
              .sort((a, b) => Number(b.gas - a.gas))
              .slice(0, 10)
              .map((tx: any, index: number) => {
              const gasPercentage = Number((tx.gas * 100n) / metrics.gasLimit)
              return (
                <div key={tx.hash} className="transaction">
                  <p>Transaction {index + 1}</p>
                  <p>Hash: {tx.hash.slice(0, 10)}...</p>
                  <p>Gas: {tx.gas.toString()} ({gasPercentage.toFixed(2)}% of limit)</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`
        .container {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .gas-metrics {
          margin-top: 20px;
        }
        .transactions {
          margin-top: 20px;
        }
        .transaction {
          border: 1px solid #ddd;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}

export default App
