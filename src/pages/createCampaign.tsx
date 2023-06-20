import { ethers } from "ethers";
import styles from "../../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useRouter } from "next/router";

import campaignManagerABI from "../../utils/campaignABIs/campaignManager.json";

export default function Home() {
  const router = useRouter();

  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [deadline, setDeadline] = useState<number>(0);

  const [loadedData, setLoadedData] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);

  const campaignManagerContractAddress = router.query.managerAddress as string;

  function openModal() {
    setIsLoading(true);
  }

  function closeModal() {
    setIsLoading(false);
  }

  const goToHomepage = () => {
    router.push({
      pathname: "/",
    });
  };

  async function switchToGoerliNetwork() {
    const { ethereum } = window;
    try {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x5", //requires 0x prefix in hex
            rpcUrls: [
              "https://rpc.ankr.com/eth_goerli",
              "https://ethereum-goerli.publicnode.com",
            ],
            chainName: "Goerli",
            nativeCurrency: {
              name: "Goerli",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: ["https://goerli.etherscan.io"],
          },
        ],
      });
    } catch (error: any) {
      // console.error(error);
      alert(`Error: ${error.message}`);
    }
  }

  async function createCampaign() {
    try {
      //check if required fields are empty
      if (!title || !description || !targetAmount || !deadline) {
        return alert("Fill all the fields");
      }

      //check if fields meet requirements
      if (targetAmount < 0) {
        return alert("Amount must be more than 0");
      }

      if (deadline < 5) {
        return alert("Duration must be more than 5 mins");
      }

      const minutesToAdd = deadline; // Replace with the desired number of minutes to add

      const currentTime = new Date();
      const futureTime = new Date(currentTime.getTime() + minutesToAdd * 60000); // Add minutes in milliseconds

      const futureTimestamp = futureTime.getTime() / 1000; // Convert to seconds
      const hexTimestamp = "0x" + futureTimestamp.toString(16); // Convert to hexadecimal
      const integerTimestamp = parseInt(hexTimestamp, 16); // Parse hexadecimal without decimal part

      const formattedHexTimestamp = "0x" + integerTimestamp.toString(16); // Convert back to hexadecimal

      const { ethereum } = window;

      if (ethereum) {
        //set loading modal to open and loading modal text
        setLoadedData("Creating campaign ...Please wait");
        openModal();

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        //create contract instance
        const campaignManagerContractInstance = new ethers.Contract(
          campaignManagerContractAddress as string,
          campaignManagerABI,
          signer
        );

        // create campaign
        // (6) call  createCampaign function from the contract

        // (7) wait for transaction to be mined

        //close modal
        closeModal();

        // (8) display alert message

        //clear fields
        setTitle("");
        setDescription("");
        setDeadline(0);
        setTargetAmount(0);
        //redirect back to homepage
        goToHomepage();
      }
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
      return `${error}`;
    }
  }

  async function connectWallet() {
    //connect metamask account on page enter
    const { ethereum } = window;

    // Check if MetaMask is installed
    if (!ethereum) {
      return "Make sure you have MetaMask Connected!";
    }

    // Get user Metamask Ethereum wallet address
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    // Get the first account address
    const walletAddr = accounts[0];
    //set to variable to store current wallet address
    setCurrentWalletAddress(walletAddr);

    const provider = new ethers.providers.Web3Provider(ethereum);
    const { chainId } = await provider.getNetwork();
    // 5 - goerli, 43113 - fuji
    if (chainId !== 5) {
      await switchToGoerliNetwork();
    }
  }
  useEffect(() => {
    connectWallet();
  }, []);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      color: "black ",
    },
  };

  return (
    <>
      <div className={styles.background} style={{ margin: "-10px" }}>
        <div className={styles.topPanel}>
          <div className={styles.walletAddress}>{`Crowd-Fund App`}</div>
          <div className={styles.walletAddress}>
            {`Wallet Address: ${currentWalletAddress}`}
          </div>
        </div>

        {/* loading modal */}
        <Modal
          isOpen={isLoading}
          //onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {loadedData}
        </Modal>

        <div style={{ marginLeft: "100px", marginRight: "100px" }}>
          <div className={styles.container}>
            <h2 className={styles.headerText}>
              <div>{`Create New Campaign`}</div>
            </h2>
          </div>
          <div className={styles.container}>
            <div style={{ margin: "20px", color: "white" }}>
              <label>Title</label>
            </div>

            <div style={{ marginLeft: "20px" }}>
              <input
                type="text"
                placeholder="Add Your title here"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  display: "block",
                  backgroundColor: "black",
                  color: "white",
                  width: "600px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div style={{ margin: "20px", color: "white" }}>
              <label>Description</label>
            </div>

            <div style={{ marginLeft: "20px" }}>
              <input
                type="text"
                placeholder="Add Your description here"
                onChange={(e) => setDescription(e.target.value)}
                value={description}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  display: "block",
                  backgroundColor: "black",
                  color: "white",
                  width: "600px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div style={{ margin: "20px", color: "white" }}>
              <label>Target Amount(USDC)</label>
            </div>

            <div style={{ marginLeft: "20px" }}>
              <input
                type="number"
                placeholder="Amount"
                onChange={(e) => setTargetAmount(parseFloat(e.target.value))}
                value={targetAmount}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  display: "block",
                  backgroundColor: "black",
                  color: "white",
                  width: "600px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div style={{ margin: "20px", color: "white" }}>
              <label>Duration in Mins</label>
            </div>

            <div style={{ marginLeft: "20px" }}>
              <input
                type="number"
                placeholder="End Time(mins)"
                onChange={(e) => setDeadline(parseFloat(e.target.value))}
                value={deadline}
                style={{
                  padding: "15px",
                  textAlign: "center",
                  display: "block",
                  backgroundColor: "black",
                  color: "white",
                  width: "600px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div
              className={styles.buttonContainer}
              style={{ marginLeft: "20px" }}
            >
              <button
                className={styles.createCampaignBtn}
                onClick={createCampaign}
              >
                Create
              </button>
            </div>

            <button
              className={styles.backBtn}
              style={{ marginLeft: "20px" }}
              onClick={goToHomepage}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
