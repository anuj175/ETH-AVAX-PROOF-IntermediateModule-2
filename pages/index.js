import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function CryptoBankPage() {
  const [meMessage, setMeMessage] = useState("We are glad to serve you ");
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState("front");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
      addToTransactionHistory("Deposit", 1);
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
      addToTransactionHistory("Withdraw", -1);
    }
  }

  const transferFunds = async () => {
    if (atm) {
      let tx = await atm.TransferFunds("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", 1);
      await tx.wait();
      getBalance();
      addToTransactionHistory("Transfer", -1);
    }
  }

  const addToTransactionHistory = (action, amount) => {
    const newTransaction = {
      action,
      amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory([...transactionHistory, newTransaction]);
  }

  const clearTransactionHistory = () => {
    setTransactionHistory([]);
  }

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
 
    setATM(atmContract);
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p style={{ color: "red" }}>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p style={{ color: "green" }}>Your Balance: {balance}</p>
        <button onClick={deposit} style={{ backgroundColor: "DodgerBlue", color: "white" }}>Deposit 1 ETH</button>
        <button onClick={withdraw} style={{ backgroundColor: "Orange", color: "white" }}>Withdraw 1 ETH</button>
        <button onClick={transferFunds} style={{ backgroundColor: "Purple", color: "white" }}>Transfer 1 ETH</button>
        <button onClick={() => setCurrentPage("history")} style={{ backgroundColor: "SlateGray", color: "white" }}>Transaction History</button>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="CryptoBank">
      <header><h1 style={{ color: "MediumBlue" }}>WELCOME TO ANUJ's CRYPTO BANK!</h1></header>
      <h2>{meMessage}</h2>

      {currentPage === "front" ? (
        initUser()
      ) : (
        <div>
          <h3 style={{ color: "Teal" }}>Transaction History:</h3>
          <ul>
            {transactionHistory.map((transaction, index) => (
              <li key={index}>
                {`${transaction.action}: ${transaction.amount} ETH (${transaction.timestamp})`}
              </li>
            ))}
          </ul>
          <button onClick={() => setCurrentPage("front")} style={{ backgroundColor: "SlateGray", color: "white" }}>Go Back</button>
          <button onClick={clearTransactionHistory} style={{ backgroundColor: "FireBrick", color: "white" }}>Clear Transaction History</button>
        </div>
      )}

      <style jsx>{`
        .CryptoBank {
          width: 100%;
          height: 100vh;
          background-color: LightGray;
          text-align: center;
          font-family: Arial, sans-serif;
        }
      `}
      </style>
    </main>
  )
}
