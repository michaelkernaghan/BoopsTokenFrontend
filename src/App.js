import './App.css';
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers, Contract, BigNumber } from "ethers";
import BOOPSToken from './abi/BOOPSToken.json'
import boopsImage from './assets/boopsImage.png';

const ConnectButton = styled.button`
  color: lightgray;
  background-color: transparent;
  border: 5px solid #FFD580;
  border-radius: 10px;
  padding: 5px 55px;
  font-size: 4rem;
  transition: .251s color;
  cursor: pointer;
  &:hover {
    color: gray;
  }
`

const WalletLink = styled.a`
  color: lightgray;
  transition: .251s color;
  text-decoration: none;
  &:hover {
    color: gray;
  }
`

const TokenDetailsList = styled.ul`
  list-style-type: none;
  text-align: left;
`

function App() {
  const [tokenDetails, setTokenDetails] = useState(null)
  const [contract, setContract] = useState(null)
  const [hasProvider, setHasProvider] = useState(null)
  const initialState = { accounts: [] }
  const [wallet, setWallet] = useState(initialState)

  useEffect(() => {
    const connectContract = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner();
      const contract = new Contract("0x77032D64af56cF019714590030aB8193A6bCaa0c", BOOPSToken.abi, signer)
      setContract(contract)

      const symbol = await contract.symbol()
      const totalSupply = await contract.totalSupply()
      const formattedTotalSupply = new Intl.NumberFormat('en-US').format(totalSupply.toString())
      setTokenDetails({ symbol, totalSupply: formattedTotalSupply })
      
    }
    const refreshAccounts = (accounts) => {
      if (accounts.length > 0) {
        updateWallet(accounts)
      } else {
        setWallet(initialState)
      }
    }

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })
      setHasProvider(Boolean(provider))

      if (provider) {
        const accounts = await window.ethereum.request(
          { method: 'eth_accounts' }
        )
        refreshAccounts(accounts)
        window.ethereum.on('accountsChanged', refreshAccounts)
        if(accounts.length > 0) 
          connectContract()
      }
    }

    getProvider()
    return () => {
      window.ethereum?.removeListener('accountsChanged', refreshAccounts)
    }
  }, [])

  const updateWallet = async (accounts) => {
    setWallet({ accounts })
  }

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    updateWallet(accounts)
  }

  return (
    <div className="App">
      <header className="App-header">
  
        { /* Add Image Here */ }
        <img src={boopsImage} alt="Example" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
  
        {window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&
          <ConnectButton onClick={handleConnect}>Connect</ConnectButton>
        }
        {wallet.accounts.length > 0 &&
          <div>
            <TokenDetailsList>
              <li>Symbol: {tokenDetails && JSON.stringify(tokenDetails.symbol)}</li>
              <li>Total Supply: {tokenDetails && tokenDetails.totalSupply}</li>
            </TokenDetailsList>
          </div>
        }
      </header>
    </div>
  );
}

export default App;