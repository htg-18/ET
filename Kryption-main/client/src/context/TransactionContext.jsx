import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();
console.log(contractAddress);
// console.log(contractABI);
const { ethereum } = window;

const createEthereumContract = async() => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  
  console.log(transactionsContract);
  console.log(transactionsContract.interface);

  return transactionsContract;
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };
 
  
  const getAllTransactions = async () => {
    
    try {
      if (ethereum) {
        // const transactionsContract = createEthereumContract();
        // console.log(transactionsContract);
        // console.log(transactionsContract.interface);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
  
        const availableTransactions = await transactionsContract.getAllTransactions();

        const structuredTransactions = availableTransactions.map((transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / (10 ** 18)
        }));

        console.log(structuredTransactions);

        setTransactions(structuredTransactions);
      } else {
        console.log("Ethereum is not present");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

         getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    // console.log(ethereum);
    try{
      if (ethereum) {
        // const transactionsContract = createEthereumContract();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        const currentTransactionCount = await transactionsContract.getTransactionCount();
  
        if (currentTransactionCount > 0) {
          // There are existing transactions
          console.log("Existing transactions found.");
          // Optionally, you can fetch and display these transactions
          const existingTransactions = await transactionsContract.getAllTransactions();
          console.log("Existing Transactions:", existingTransactions);
        } else {
          console.log("No existing transactions.");
        }
  
        // Save the current transaction count to local storage
        window.localStorage.setItem("transactionCount", currentTransactionCount);
      }
    }catch(e){
      console.log(e);
      throw new Error("No ethereum object");
    }
   
  };
  

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts", });

      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      if (ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        // const transactionsContract = createEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
        
         
        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", //21000 gwei
            value: parsedAmount._hex,
          }],
        });
        
        // console.log("start");
        // console.log(transactionsContract);
        const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
       
        // console.log("end");
        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactionsContract.getTransactionCount();

        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
