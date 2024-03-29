import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import detectEthereumProvider from '@metamask/detect-provider';
import BOOPSToken from './abi/BOOPSToken.json';
import './App.css'; // Import your CSS file here

const ethers = require("ethers");

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

const TokenDetailsList = styled.ul`
  list-style-type: none;
  text-align: left;
`

const ContractAddressLink = styled.a`
  color: #CBA135; /* A more subdued gold color */
  &:hover {
    color: #B28A30; /* A slightly darker shade for hover state */
  }
`

function App() {
  const contractAddress = "0xD4d26c5e437173796B3ff41Fc5a75Ab96eB604eA"; // Define your contract address here
  const etherscanLink = `https://testnet-explorer.etherlink.com/token/${contractAddress}`;

  const [tokenDetails, setTokenDetails] = useState(null);
  const [contract, setContract] = useState(null);
  const [wallet, setWallet] = useState({ accounts: [] });
  const [boopsBalance, setBoopsBalance] = useState('0');

  const connectContract = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, BOOPSToken.abi, signer);
      setContract(contract);

      const symbol = await contract.symbol();
      const totalSupply = await contract.totalSupply();
      const formattedTotalSupply = ethers.utils.formatUnits(totalSupply, 'ether');
      setTokenDetails({ symbol, totalSupply: formattedTotalSupply });
    } else {
      console.error('Please install MetaMask!');
    }
  }, []); // The empty array ensures that the function is only created once


  const fetchBoopsBalance = useCallback(async (account) => {
    try {
      const balance = await contract.balanceOf(account);
      const formattedBalance = ethers.utils.formatUnits(balance, 'ether');
      setBoopsBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBoopsBalance('0');
    }
  }, [contract]);

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      if (provider) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWallet({ accounts });
          connectContract();
          fetchBoopsBalance(accounts[0]);
        }
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setWallet({ accounts });
            fetchBoopsBalance(accounts[0]);
          } else {
            setWallet({ accounts: [] });
          }
        });
      }
    };

    getProvider();

    return () => {
      window.ethereum?.removeListener('accountsChanged', (accounts) => {
        setWallet({ accounts: [] });
      });
    };
  }, [connectContract, fetchBoopsBalance]);

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet({ accounts });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Cats give BOOPS</h1>
        {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
          <ConnectButton onClick={handleConnect}>Connect</ConnectButton>
        )}
        {wallet.accounts.length > 0 && (
          <div className="Token-info">
            <br />
            <img src="./boopsImage.png" className="Featured-image" alt="cats give boops" />
            <TokenDetailsList>
              <li>Symbol: {tokenDetails && JSON.stringify(tokenDetails.symbol)}</li>
              <li>Total Supply: {tokenDetails && tokenDetails.totalSupply}</li>
              <li>Your BOOPS Balance: {boopsBalance}</li>
            </TokenDetailsList>
            <p>Contract Address: <ContractAddressLink href={etherscanLink} target="_blank" rel="noopener noreferrer">{contractAddress}</ContractAddressLink></p>
            To disconnect, stop the Active Connection in Metamask
          </div>
        )}
      </header>
      <br></br>
      <footer className="App-footer">
      <a href="https://boopsfaucet.netlify.app/" target="_blank" rel="noopener noreferrer">BOOPS Faucet</a>
      </footer>
    </div>
  );

};

export default App;

