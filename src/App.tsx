import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { http } from 'viem'
import { createPublicClient } from 'viem'
import { monadTestnet } from 'viem/chains'

function App() {
  const [count, setCount] = useState(0)
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null)

  const publicClient = createPublicClient({
    chain: monadTestnet,
    transport: http(),
  })

  useEffect(() => {
    const getBlockNumber = async () => {
      const number = await publicClient.getBlockNumber()
      setBlockNumber(number)
    }
    getBlockNumber()
  }, [])

  return (
    <>
      <div>
       {blockNumber?.toString()}
      </div>
  
    </>
  )
}

export default App
