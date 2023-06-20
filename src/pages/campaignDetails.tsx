import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { ethers } from "ethers";
import styles from "../../styles/Home.module.css";
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import Modal from "react-modal";
import { useRouter } from "next/router";
import { Campaign } from "@/app/page";
import { AbiItem } from "web3-utils";
//ABI
import campaignManagerABI from "../../utils/campaignABIs/campaignManager.json";
import usdcABI from "../../utils/Usdc.json";
import messageTransmitterABI from "../../utils/MessageTransmitter.json";
import tokenMessengerABI from "../../utils/TokenMessenger.json";

type CCTPTransferStatus = {
  approveTokens: {
    description: string;
    status: boolean;
    loading: boolean;
  };
  burnTokens: {
    description: string;
    status: boolean;
    loading: boolean;
  };
  retrieveMessage: {
    description: string;
    status: boolean;
    loading: boolean;
  };
  fetchSignature: {
    description: string;
    status: boolean;
    loading: boolean;
  };
  transferFunds: {
    description: string;
    status: boolean;
    loading: boolean;
  };
  approveAndDeposit: {
    //calls campaign manager contract function
    description: string;
    status: boolean;
    loading: boolean;
  };
};

export default function Home() {
  const router = useRouter();

  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");
  const [loadedData, setLoadedData] = useState("Loading...");
  const [isLoading, setIsLoading] = useState(false);
  const [USDCAmount, setUSDCAmount] = useState<string>("");

  //deposit USDC via CCTP modal
  const [transferModal, setSelectTransferModal] = useState<boolean>(false);
  const [depositCCTPStatus, setDepositStatus] = useState<CCTPTransferStatus>({
    approveTokens: {
      description: "Approving messenger contract to withdraw",
      status: false,
      loading: false,
    },
    burnTokens: {
      description: "Deposit tokens for burn",
      status: false,
      loading: false,
    },
    retrieveMessage: {
      description: "Retrieve message bytes from logs",
      status: false,
      loading: false,
    },
    fetchSignature: {
      description: "Fetching attestation signature",
      status: false,
      loading: false,
    },
    transferFunds: {
      description: "Transferring the funds to destination chain and address",
      status: false,
      loading: false,
    },
    approveAndDeposit: {
      //calls campaign manager contract function
      description: "Approving and depositing funds....",
      status: false,
      loading: false,
    },
  });

  //refund/withdraw USDC via CCTP modal
  const [refundModal, setRefundModal] = useState<boolean>(false);
  const [refundCCTPStatus, setRefundStatus] = useState<CCTPTransferStatus>({
    approveAndDeposit: {
      //calls campaign manager contract function
      description: "Approving and depositing funds....",
      status: false,
      loading: false,
    },
    approveTokens: {
      description: "Approving messenger contract to withdraw",
      status: false,
      loading: false,
    },
    burnTokens: {
      description: "Deposit tokens for burn",
      status: false,
      loading: false,
    },
    retrieveMessage: {
      description: "Retrieve message bytes from logs",
      status: false,
      loading: false,
    },
    fetchSignature: {
      description: "Fetching attestation signature",
      status: false,
      loading: false,
    },
    transferFunds: {
      description: "Transferring the funds to destination chain and address",
      status: false,
      loading: false,
    },
  });

  const [campaigns, setCampaigns] = useState<Campaign>({
    title: "",
    description: "",
    campaignSCAddress: "",
    targetAmount: 0,
    currentAmount: 0,
    deadline: 0,
    userContribution: 0,
    status: "",
    campaignCreator: "",
  });

  // router params items
  const campaignContractAddress = router.query.address as string;
  const campaignManagerContractAddress = router.query.managerAddress as string;

  function openModal() {
    setIsLoading(true);
  }

  function closeModal() {
    setIsLoading(false);
  }

  function closeDepositCCTPModal() {
    setSelectTransferModal(false);
    resetDepositCCTPModal();
  }

  function closeRefundCCTPModal() {
    setRefundModal(false);
    resetRefundCCTPModal();
  }

  function resetDepositCCTPModal() {
    setDepositStatus({
      approveTokens: {
        description: "Approving messenger contract to withdraw",
        status: false,
        loading: false,
      },
      burnTokens: {
        description: "Deposit tokens for burn",
        status: false,
        loading: false,
      },
      retrieveMessage: {
        description: "Retrieve message bytes from logs",
        status: false,
        loading: false,
      },
      fetchSignature: {
        description: "Fetching attestation signature",
        status: false,
        loading: false,
      },
      transferFunds: {
        description: "Transferring the funds to destination chain and address",
        status: false,
        loading: false,
      },
      approveAndDeposit: {
        //calls campaign manager contract function
        description: "Approving and depositing funds....",
        status: false,
        loading: false,
      },
    });
  }

  function resetRefundCCTPModal() {
    setRefundStatus({
      approveTokens: {
        description: "Approving messenger contract to withdraw",
        status: false,
        loading: false,
      },
      burnTokens: {
        description: "Deposit tokens for burn",
        status: false,
        loading: false,
      },
      retrieveMessage: {
        description: "Retrieve message bytes from logs",
        status: false,
        loading: false,
      },
      fetchSignature: {
        description: "Fetching attestation signature",
        status: false,
        loading: false,
      },
      transferFunds: {
        description: "Transferring the funds to destination chain and address",
        status: false,
        loading: false,
      },
      approveAndDeposit: {
        //calls campaign manager contract function
        description: "Approving and depositing funds....",
        status: false,
        loading: false,
      },
    });
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

    await getCurrentCampaignData();
  }

  async function getCurrentCampaignData() {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      if (
        campaignContractAddress != undefined &&
        campaignManagerContractAddress != undefined
      ) {
        const campaignManagerContractInstance = new ethers.Contract(
          campaignManagerContractAddress as string,
          campaignManagerABI,
          signer
        );

        const allCampaignData =
          await campaignManagerContractInstance.getCampaignData([
            campaignContractAddress,
          ]);

        let title: string = allCampaignData.title[0];
        let description: string = allCampaignData.description[0];
        let campaignSCAddress: string = campaignContractAddress;
        let targetAmount: string = allCampaignData.targetAmount[0];
        let currentAmount: string = allCampaignData.currentAmount[0];
        let deadline: string = allCampaignData.deadline[0];
        let userContribution: string = allCampaignData.userContribution[0];
        let status: string = allCampaignData.status[0];
        let proposer: string = allCampaignData.proposer[0];

        const decimalEpochTime = parseInt(deadline, 16); // Convert hex to number
        const hexValue = decimalEpochTime.toString(16); // Convert to hexadecimal

        const unixTimestamp = parseInt(hexValue) * 1000; // Convert to milliseconds
        const deadlineDate = new Date(unixTimestamp);
        // const readableFormat = date.toString();

        const currentTime = new Date();
        const differenceInMinutes = Math.floor(
          (deadlineDate.getTime() - currentTime.getTime()) / (1000 * 60) //deadline time left in minutes
        );

        let newItem: Campaign = {
          title,
          description,
          campaignSCAddress,
          targetAmount: parseFloat(ethers.utils.formatUnits(targetAmount, 6)),
          currentAmount: parseFloat(ethers.utils.formatUnits(currentAmount, 6)),
          deadline: differenceInMinutes,
          userContribution: parseFloat(
            ethers.utils.formatUnits(userContribution, 6)
          ),
          status,
          campaignCreator: proposer,
        };

        setCampaigns(newItem);
      }
    }
  }

  async function depositFunds(depositByCCTP: boolean) {
    if (!USDCAmount) {
      return alert("USDC Amount field is empty. ");
    }

    if (
      parseFloat(USDCAmount) == null ||
      Number.isNaN(parseFloat(USDCAmount))
    ) {
      return alert("USDC Amount must be a number. ");
    }

    if (parseFloat(USDCAmount) == null || parseFloat(USDCAmount) == undefined) {
      return alert("USDC Amount must be a number. ");
    }

    if (campaigns.deadline < 1) {
      return alert("Campaign has ended.");
    }

    const usdcContractAddress = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"; // USDC contract address on goerli testnet

    const { ethereum } = window;

    try {
      if (ethereum) {
        setLoadedData("Approving USDC to be send...Please wait");

        if (depositByCCTP == false) {
          openModal(); //CCTP modal is open then open current modal
        }

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        // (9) create USDC contract instance
        const usdcContractInstance = new ethers.Contract(
          usdcContractAddress,
          usdcABI,
          signer
        );

        // (10) call approve function from the usdc contract
        const approveUsdcTxn = await usdcContractInstance.approve(
          campaignContractAddress,
          ethers.utils.parseUnits(USDCAmount, 6),
          {
            gasLimit: 1200000,
          }
        );

        // (11) wait for the transction to be mined
        await approveUsdcTxn.wait();
        if (depositByCCTP == false) {
          alert(`Transaction sent! Hash: ${approveUsdcTxn.hash}`);
        }

        setLoadedData("Deposit funds...please wait");

        const campaignManagerContractInstance = new ethers.Contract(
          campaignManagerContractAddress as string,
          campaignManagerABI,
          signer
        );

        // (12) call deposit function from the smart contract
        let { hash } = await campaignManagerContractInstance.deposit(
          ethers.utils.parseUnits(USDCAmount, 6),
          campaignContractAddress,
          {
            gasLimit: 1200000,
          }
        );

        // (13) wait for transaction to be mined
        await provider.waitForTransaction(hash);

        if (depositByCCTP == false) {
          alert(`Transaction sent! Hash: ${hash}`);
        }

        await getCurrentCampaignData();

        setDepositStatus((prevState) => ({
          ...prevState,
          approveAndDeposit: {
            ...prevState.approveAndDeposit,
            description: `USDC deposit to campaign. Confirmed at ${hash}`,
            status: true,
            loading: false,
          },
        }));

        closeModal();
        setUSDCAmount("");
      }
    } catch (error) {
      closeModal();
      setSelectTransferModal(false);
      alert(`Error: ${error}`);
      return `${error}`;
    }
  }

  async function refund(refundByCCTP: boolean) {
    if (campaigns.userContribution <= 0) {
      return alert(
        "User has not contributed any USDC, refund cannot be processed."
      );
    }

    if (campaigns.currentAmount <= 0) {
      return alert("Campaign does not contain any USDC.");
    }
    const { ethereum } = window;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      setLoadedData("Refunding funds...please wait");
      if (refundByCCTP == false) {
        openModal(); //CCTP modal is open then open current modal
      } else {
        setRefundModal(true); //open cctp modal
      }

      setRefundStatus((prevState) => ({
        ...prevState,
        approveAndDeposit: {
          ...prevState.approveAndDeposit,
          description: "Refunding USDC back to ETH wallet",
          status: true,
          loading: true,
        },
      }));

      const campaignManagerContractInstance = new ethers.Contract(
        campaignManagerContractAddress as string,
        campaignManagerABI,
        signer
      );
      let { hash } = await campaignManagerContractInstance.refund(
        campaignContractAddress,
        {
          gasLimit: 1200000,
        }
      );

      //wait for transaction to be mined
      await provider.waitForTransaction(hash);
      if (refundByCCTP == false) {
        alert(`Transaction sent! Hash: ${hash}`);
      }

      await getCurrentCampaignData();

      setRefundStatus((prevState) => ({
        ...prevState,
        approveAndDeposit: {
          ...prevState.approveAndDeposit,
          description: `USDC refunded back to user. Confirmed at ${hash}`,
          status: true,
          loading: false,
        },
      }));

      closeModal();
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
      return `${error}`;
    }
  }

  const waitForTransaction = async (
    web3: { eth: { getTransactionReceipt: (arg0: any) => any } },
    txHash: any
  ) => {
    let transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
    while (
      transactionReceipt != null &&
      transactionReceipt.status === "FALSE"
    ) {
      transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
      await new Promise((r) => setTimeout(r, 4000));
    }
    return transactionReceipt;
  };

  async function avaxToEth() {
    const metamaskPrivateKey = process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY;
    if (metamaskPrivateKey == undefined) {
      return alert("Metamask private key is undefined");
    }

    const infuraAPIKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;
    if (infuraAPIKey == undefined) {
      return alert("Infura API key is undefined");
    }

    setSelectTransferModal(true); //open cctp modal
    setDepositStatus((prevState) => ({
      ...prevState,
      approveTokens: {
        ...prevState.approveTokens,
        status: true,
        loading: true,
      },
    }));

    try {
      const web3 = new Web3("https://api.avax-test.network/ext/C/rpc");

      // Add ETH private key used for signing transactions
      const ethSigner =
        web3.eth.accounts.privateKeyToAccount(metamaskPrivateKey);
      web3.eth.accounts.wallet.add(ethSigner);

      // Add AVAX private key used for signing transactions
      const avaxSigner =
        web3.eth.accounts.privateKeyToAccount(metamaskPrivateKey);
      web3.eth.accounts.wallet.add(avaxSigner);

      // Testnet Contract Addresses
      const AVAX_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        "0xeb08f243e5d3fcff26a9e38ae5520a669f4019d0";
      const USDC_AVAX_CONTRACT_ADDRESS =
        "0x5425890298aed601595a70ab815c96711a31bc65";
      const ETH_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
        "0x26413e8157cd32011e726065a5462e97dd4d03d9";

      // initialize contracts using address and ABI
      const avaxTokenMessengerContract = new web3.eth.Contract(
        tokenMessengerABI as AbiItem[],
        AVAX_TOKEN_MESSENGER_CONTRACT_ADDRESS,
        { from: ethSigner.address }
      );
      const usdcAvaxContract = new web3.eth.Contract(
        usdcABI as AbiItem[],
        USDC_AVAX_CONTRACT_ADDRESS,
        { from: ethSigner.address }
      );

      const ethMessageTransmitterContract = new web3.eth.Contract(
        messageTransmitterABI as AbiItem[],
        ETH_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS,
        { from: avaxSigner.address }
      );

      // AVAX destination address
      const mintRecipient = currentWalletAddress;
      const destinationAddressInBytes32 = web3.utils
        .padLeft(mintRecipient, 64)
        .toLowerCase();
      const ETH_DESTINATION_DOMAIN = 0;

      // Amount that will be transferred
      const amount = (parseFloat(USDCAmount) * 1e6).toFixed(0);

      // STEP 1: Approve messenger contract to withdraw from our active eth address
      const approveTxGas = await usdcAvaxContract.methods
        .approve(AVAX_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
        .estimateGas();
      const approveTx = await usdcAvaxContract.methods
        .approve(AVAX_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
        .send({ gas: approveTxGas });
      const approveTxReceipt = await waitForTransaction(
        web3,
        approveTx.transactionHash
      );
      console.log("ApproveTxReceipt: ", approveTxReceipt);

      setDepositStatus((prevState) => ({
        ...prevState,
        approveTokens: {
          ...prevState.approveTokens,
          description: `Approval has been confirmed: ${approveTx.transactionHash}`,
          status: true,
          loading: false,
        },
      }));

      setDepositStatus((prevState) => ({
        ...prevState,
        burnTokens: {
          ...prevState.burnTokens,
          status: true,
          loading: true,
        },
      }));
      // STEP 2: Burn USDC
      const burnTxGas = await avaxTokenMessengerContract.methods
        .depositForBurn(
          amount,
          ETH_DESTINATION_DOMAIN,
          destinationAddressInBytes32,
          USDC_AVAX_CONTRACT_ADDRESS
        )
        .estimateGas();
      const burnTx = await avaxTokenMessengerContract.methods
        .depositForBurn(
          amount,
          ETH_DESTINATION_DOMAIN,
          destinationAddressInBytes32,
          USDC_AVAX_CONTRACT_ADDRESS
        )
        .send({ gas: burnTxGas });
      const burnTxReceipt = await waitForTransaction(
        web3,
        burnTx.transactionHash
      );
      console.log("BurnTxReceipt: ", burnTxReceipt);

      setDepositStatus((prevState) => ({
        ...prevState,
        burnTokens: {
          ...prevState.burnTokens,
          description: `Burn has been confirmed: ${burnTx.transactionHash}`,
          status: true,
          loading: false,
        },
      }));

      setDepositStatus((prevState) => ({
        ...prevState,
        retrieveMessage: {
          ...prevState.retrieveMessage,
          status: true,
          loading: true,
        },
      }));

      // STEP 3: Retrieve message bytes from logs
      const transactionReceipt = await web3.eth.getTransactionReceipt(
        burnTx.transactionHash
      );
      const eventTopic = web3.utils.keccak256("MessageSent(bytes)");
      const log: any = transactionReceipt.logs.find(
        (l) => l.topics[0] === eventTopic
      );
      const messageBytes = web3.eth.abi.decodeParameters(
        ["bytes"],
        log.data
      )[0];
      const messageHash = web3.utils.keccak256(messageBytes);

      console.log(`MessageBytes: ${messageBytes}`);
      console.log(`MessageHash: ${messageHash}`);

      setDepositStatus((prevState) => ({
        ...prevState,
        retrieveMessage: {
          ...prevState.retrieveMessage,
          description: `Message has been retrieved.`,
          status: true,
          loading: false,
        },
      }));

      setDepositStatus((prevState) => ({
        ...prevState,
        fetchSignature: {
          ...prevState.fetchSignature,
          status: true,
          loading: true,
        },
      }));

      // STEP 4: Fetch attestation signature
      let attestationResponse: any = { status: "pending" };
      while (attestationResponse.status != "complete") {
        const response = await fetch(
          `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
        );
        attestationResponse = await response.json();
        await new Promise((r) => setTimeout(r, 2000));
      }

      const attestationSignature = attestationResponse.attestation;
      console.log(`Signature: ${attestationSignature}`);

      setDepositStatus((prevState) => ({
        ...prevState,
        fetchSignature: {
          ...prevState.fetchSignature,
          description: `Attestation signature retrieved.`,
          status: true,
          loading: false,
        },
      }));

      setDepositStatus((prevState) => ({
        ...prevState,
        transferFunds: {
          ...prevState.transferFunds,
          status: true,
          loading: true,
        },
      }));

      // STEP 5: Using the message bytes and signature recieve the funds on destination chain and address
      web3.setProvider(`https://goerli.infura.io/v3/${infuraAPIKey}`); // Connect web3 to ETH goerli testnet
      const receiveTxGas = await ethMessageTransmitterContract.methods
        .receiveMessage(messageBytes, attestationSignature)
        .estimateGas();
      const receiveTx = await ethMessageTransmitterContract.methods
        .receiveMessage(messageBytes, attestationSignature)
        .send({ gas: receiveTxGas });
      const receiveTxReceipt = await waitForTransaction(
        web3,
        receiveTx.transactionHash
      );
      console.log("ReceiveTxReceipt: ", receiveTxReceipt);

      // alert(`Transaction hash: ${receiveTx.transactionHash}`);

      setDepositStatus((prevState) => ({
        ...prevState,
        transferFunds: {
          ...prevState.transferFunds,
          description: `USDC transferred to destination chain.`,
          status: true,
          loading: false,
        },
      }));

      setDepositStatus((prevState) => ({
        ...prevState,
        approveAndDeposit: {
          ...prevState.approveAndDeposit,
          status: true,
          loading: true,
        },
      }));
    } catch (error) {
      setSelectTransferModal(false);
      alert(`Error: ${error}`);
    }
  }

  async function depositFundsCCTP() {
    if (!USDCAmount) {
      return alert("USDC Amount field is empty. ");
    }

    if (
      parseFloat(USDCAmount) == null ||
      Number.isNaN(parseFloat(USDCAmount))
    ) {
      return alert("USDC Amount must be a number. ");
    }

    if (parseFloat(USDCAmount) == null || parseFloat(USDCAmount) == undefined) {
      return alert("USDC Amount must be a number. ");
    }

    if (campaigns.deadline < 1) {
      return alert("Campaign has ended.");
    }

    try {
      //transfer USDC from AVAX chain to goerliETH wallet

      await avaxToEth();

      const metamaskPrivateKey = process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY;
      const infuraAPIKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;
      if (metamaskPrivateKey != undefined && infuraAPIKey != undefined) {
        //call depositFunds function to deposit USDC to campaign contract address

        await depositFunds(true);
      }
    } catch (error) {
      setSelectTransferModal(false);
      alert(`Error: ${error}`);
    }
  }

  async function ethToAvax(usdcAmount: number) {
    const metamaskPrivateKey = process.env.NEXT_PUBLIC_METAMASK_PRIVATE_KEY;
    if (metamaskPrivateKey == undefined) {
      return alert("Metamask private key is undefined");
    }
    const infuraAPIKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;
    if (infuraAPIKey == undefined) {
      return alert("Infura API key is undefined");
    }

    try {
      setRefundModal(true); //open cctp modal
      setRefundStatus((prevState) => ({
        ...prevState,
        approveTokens: {
          ...prevState.approveTokens,
          status: true,
          loading: true,
        },
      }));

      const web3 = new Web3(`https://goerli.infura.io/v3/${infuraAPIKey}`);

      // Add ETH private key used for signing transactions
      const ethSigner =
        web3.eth.accounts.privateKeyToAccount(metamaskPrivateKey);
      web3.eth.accounts.wallet.add(ethSigner);

      // Add AVAX private key used for signing transactions
      const avaxSigner =
        web3.eth.accounts.privateKeyToAccount(metamaskPrivateKey);
      web3.eth.accounts.wallet.add(avaxSigner);

      // Testnet Contract Addresses
      const ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS =
        "0xd0c3da58f55358142b8d3e06c1c30c5c6114efe8";
      const USDC_ETH_CONTRACT_ADDRESS =
        "0x07865c6e87b9f70255377e024ace6630c1eaa37f";

      const AVAX_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
        "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79";

      // initialize contracts using address and ABI
      const ethTokenMessengerContract = new web3.eth.Contract(
        tokenMessengerABI as AbiItem[],
        ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS,
        { from: ethSigner.address }
      );
      const usdcEthContract = new web3.eth.Contract(
        usdcABI as AbiItem[],
        USDC_ETH_CONTRACT_ADDRESS,
        { from: ethSigner.address }
      );

      const avaxMessageTransmitterContract = new web3.eth.Contract(
        messageTransmitterABI as AbiItem[],
        AVAX_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS,
        { from: avaxSigner.address }
      );

      // AVAX destination address
      const mintRecipient = currentWalletAddress;
      const destinationAddressInBytes32 = web3.utils
        .padLeft(mintRecipient, 64)
        .toLowerCase();
      const AVAX_DESTINATION_DOMAIN = 1;

      // Amount that will be transferred
      const amount = (usdcAmount * 1e6).toFixed(0);

      // STEP 1: Approve messenger contract to withdraw from our active eth address
      const approveTxGas = await usdcEthContract.methods
        .approve(ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
        .estimateGas();
      const approveTx = await usdcEthContract.methods
        .approve(ETH_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
        .send({ gas: approveTxGas });
      const approveTxReceipt = await waitForTransaction(
        web3,
        approveTx.transactionHash
      );
      console.log("ApproveTxReceipt: ", approveTxReceipt);

      setRefundStatus((prevState) => ({
        ...prevState,
        approveTokens: {
          ...prevState.approveTokens,
          description: `Approval has been confirmed: ${approveTx.transactionHash}`,
          status: true,
          loading: false,
        },
      }));

      setRefundStatus((prevState) => ({
        ...prevState,
        burnTokens: {
          ...prevState.burnTokens,
          status: true,
          loading: true,
        },
      }));

      // STEP 2: Burn USDC
      const burnTxGas = await ethTokenMessengerContract.methods
        .depositForBurn(
          amount,
          AVAX_DESTINATION_DOMAIN,
          destinationAddressInBytes32,
          USDC_ETH_CONTRACT_ADDRESS
        )
        .estimateGas();
      const burnTx = await ethTokenMessengerContract.methods
        .depositForBurn(
          amount,
          AVAX_DESTINATION_DOMAIN,
          destinationAddressInBytes32,
          USDC_ETH_CONTRACT_ADDRESS
        )
        .send({ gas: burnTxGas });
      const burnTxReceipt = await waitForTransaction(
        web3,
        burnTx.transactionHash
      );
      console.log("BurnTxReceipt: ", burnTxReceipt);

      setRefundStatus((prevState) => ({
        ...prevState,
        burnTokens: {
          ...prevState.burnTokens,
          description: `Burn has been confirmed: ${burnTx.transactionHash}`,
          status: true,
          loading: false,
        },
      }));

      setRefundStatus((prevState) => ({
        ...prevState,
        retrieveMessage: {
          ...prevState.retrieveMessage,
          status: true,
          loading: true,
        },
      }));

      // STEP 3: Retrieve message bytes from logs
      const transactionReceipt = await web3.eth.getTransactionReceipt(
        burnTx.transactionHash
      );
      const eventTopic = web3.utils.keccak256("MessageSent(bytes)");
      const log: any = transactionReceipt.logs.find(
        (l) => l.topics[0] === eventTopic
      );
      const messageBytes = web3.eth.abi.decodeParameters(
        ["bytes"],
        log.data
      )[0];
      const messageHash = web3.utils.keccak256(messageBytes);

      console.log(`MessageBytes: ${messageBytes}`);
      console.log(`MessageHash: ${messageHash}`);

      setRefundStatus((prevState) => ({
        ...prevState,
        retrieveMessage: {
          ...prevState.retrieveMessage,
          description: `Message has been retrieved.`,
          status: true,
          loading: false,
        },
      }));

      setRefundStatus((prevState) => ({
        ...prevState,
        fetchSignature: {
          ...prevState.fetchSignature,
          status: true,
          loading: true,
        },
      }));

      setLoadedData("Fetching attestation signature...Please wait");
      // STEP 4: Fetch attestation signature
      let attestationResponse: any = { status: "pending" };
      while (attestationResponse.status != "complete") {
        const response = await fetch(
          `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
        );
        attestationResponse = await response.json();
        await new Promise((r) => setTimeout(r, 2000));
      }

      const attestationSignature = attestationResponse.attestation;
      console.log(`Signature: ${attestationSignature}`);

      setRefundStatus((prevState) => ({
        ...prevState,
        fetchSignature: {
          ...prevState.fetchSignature,
          description: `Attestation signature retrieved.`,
          status: true,
          loading: false,
        },
      }));

      setRefundStatus((prevState) => ({
        ...prevState,
        transferFunds: {
          ...prevState.transferFunds,
          status: true,
          loading: true,
        },
      }));

      setLoadedData("Sending funds to destination...Please wait");
      // STEP 5: Using the message bytes and signature recieve the funds on destination chain and address
      web3.setProvider("https://api.avax-test.network/ext/C/rpc"); // Connect web3 to AVAX testnet
      const receiveTxGas = await avaxMessageTransmitterContract.methods
        .receiveMessage(messageBytes, attestationSignature)
        .estimateGas();
      const receiveTx = await avaxMessageTransmitterContract.methods
        .receiveMessage(messageBytes, attestationSignature)
        .send({ gas: receiveTxGas });
      const receiveTxReceipt = await waitForTransaction(
        web3,
        receiveTx.transactionHash
      );
      console.log("ReceiveTxReceipt: ", receiveTxReceipt);

      setRefundStatus((prevState) => ({
        ...prevState,
        transferFunds: {
          ...prevState.transferFunds,
          description: `USDC transferred to destination chain.`,
          status: true,
          loading: false,
        },
      }));

      await getCurrentCampaignData();
    } catch (error: any) {
      closeModal();
      alert(`Error: ${error}`);
    }
  }

  async function refundViaCCTP() {
    try {
      //call refund function to deposit USDC from campaign contract address to user eth wallet
      await refund(true);

      if (campaigns.userContribution > 0 && campaigns.currentAmount > 0) {
        //call cctp function to transfer USDC from eth goerli to avax chain
        await ethToAvax(campaigns.userContribution);
      }
    } catch (error) {
      setRefundModal(false);
      alert(`Error: ${error}`);
    }
  }

  async function withdrawFunds(refundByCCTP: boolean) {
    //check if campaign current amount is more than zero
    if (campaigns.currentAmount <= 0) {
      return alert("No USDC to withraw from campaign.");
    }

    //check if campaign has ended
    if (campaigns.deadline >= 0) {
      return alert("Withdrawal can only happen after campaign has ended.");
    }

    //check if current user is the campaign creator
    if (
      campaigns.campaignCreator.toLowerCase() !==
      currentWalletAddress.toLowerCase()
    ) {
      return alert("Only Campaign creator can withdraw funds");
    }
    const { ethereum } = window;
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      setLoadedData("Withdrawing funds...please wait");
      if (refundByCCTP == false) {
        openModal(); //CCTP modal is open then open current modal
      } else {
        setRefundModal(true); //open cctp modal
      }

      setRefundStatus((prevState) => ({
        ...prevState,
        approveAndDeposit: {
          ...prevState.approveAndDeposit,
          description: "Withdrawing USDC back to ETH wallet",
          status: true,
          loading: true,
        },
      }));

      const campaignManagerContractInstance = new ethers.Contract(
        campaignManagerContractAddress as string,
        campaignManagerABI,
        signer
      );

      let { hash } = await campaignManagerContractInstance.withdraw(
        campaignContractAddress,
        {
          gasLimit: 1200000,
        }
      );

      //wait for transaction to be mined
      await provider.waitForTransaction(hash);
      if (refundByCCTP == false) {
        alert(`Transaction sent! Hash: ${hash}`);
      }
      setRefundStatus((prevState) => ({
        ...prevState,
        approveAndDeposit: {
          ...prevState.approveAndDeposit,
          description: `USDC has been withdrawed to user. Confirmed at ${hash}`,
          status: true,
          loading: false,
        },
      }));
      closeModal();

      await getCurrentCampaignData();
    } catch (error) {
      closeModal();
      alert(`Error: ${error}`);
      return `${error}`;
    }
  }

  async function withdrawViaCCTP() {
    try {
      //call withdraw funds function to retrieve USDC back to eth wallet
      await withdrawFunds(true);

      //call cctp function to transfer to AVAX wallet
      if (campaigns.deadline < 0 && campaigns.currentAmount > 0) {
        //call cctp function to transfer USDC from eth goerli to avax chain
        await ethToAvax(campaigns.currentAmount);
      }
    } catch (error) {
      setRefundModal(false);
      alert(`Error: ${error}`);
    }
  }

  useEffect(() => {
    connectWallet();
  }, [router.query, isLoading, currentWalletAddress]);

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

  const customStyles2 = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      color: "white",
      backgroundColor: "black", // black color with 80% opacity
      borderRadius: "20px",
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

        {/*  Deposit CCTP modal */}
        <Modal
          isOpen={transferModal}
          //onRequestClose={closeModal}
          style={customStyles2}
          contentLabel="Deposit CCTP Modal"
        >
          <div style={{ margin: "20px" }}>
            <div
              style={{ fontWeight: "bold", fontSize: "1.5em", color: "white" }}
            >
              {`Transfer Status`}
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    depositCCTPStatus.approveTokens.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${depositCCTPStatus.approveTokens.description}`}
              </div>
              <div>
                {depositCCTPStatus.approveTokens.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    depositCCTPStatus.burnTokens.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${depositCCTPStatus.burnTokens.description}`}
              </div>
              <div>
                {depositCCTPStatus.burnTokens.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    depositCCTPStatus.retrieveMessage.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${depositCCTPStatus.retrieveMessage.description}`}
              </div>
              <div>
                {depositCCTPStatus.retrieveMessage.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    depositCCTPStatus.fetchSignature.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${depositCCTPStatus.fetchSignature.description}`}
              </div>
              <div>
                {depositCCTPStatus.fetchSignature.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    depositCCTPStatus.transferFunds.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${depositCCTPStatus.transferFunds.description}`}
              </div>
              <div>
                {depositCCTPStatus.transferFunds.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    depositCCTPStatus.approveAndDeposit.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${depositCCTPStatus.approveAndDeposit.description}`}
              </div>
              <div>
                {depositCCTPStatus.approveAndDeposit.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            {depositCCTPStatus.approveAndDeposit.status === true &&
            depositCCTPStatus.approveAndDeposit.loading === false ? (
              <div style={{ marginTop: "20px" }}>
                <button
                  className={styles.backToHomeBtn}
                  onClick={closeDepositCCTPModal}
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </Modal>

        {/*  Refund/withdraw CCTP modal */}
        <Modal
          isOpen={refundModal}
          //onRequestClose={closeModal}
          style={customStyles2}
          contentLabel="Refund/withdraw CCTP Modal"
        >
          <div style={{ margin: "20px" }}>
            <div
              style={{ fontWeight: "bold", fontSize: "1.5em", color: "white" }}
            >
              {`Transfer Status`}
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    refundCCTPStatus.approveAndDeposit.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${refundCCTPStatus.approveAndDeposit.description}`}
              </div>
              <div>
                {refundCCTPStatus.approveAndDeposit.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    refundCCTPStatus.approveTokens.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${refundCCTPStatus.approveTokens.description}`}
              </div>
              <div>
                {refundCCTPStatus.approveTokens.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    refundCCTPStatus.burnTokens.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${refundCCTPStatus.burnTokens.description}`}
              </div>
              <div>
                {refundCCTPStatus.burnTokens.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    refundCCTPStatus.retrieveMessage.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${refundCCTPStatus.retrieveMessage.description}`}
              </div>
              <div>
                {refundCCTPStatus.retrieveMessage.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    refundCCTPStatus.fetchSignature.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${refundCCTPStatus.fetchSignature.description}`}
              </div>
              <div>
                {refundCCTPStatus.fetchSignature.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <div
                style={{
                  fontSize: "0.9em",
                  color:
                    refundCCTPStatus.transferFunds.status === true
                      ? "white"
                      : "grey",
                  marginTop: "20px",
                }}
              >
                {`${refundCCTPStatus.transferFunds.description}`}
              </div>
              <div>
                {refundCCTPStatus.transferFunds.loading === true && (
                  <Image
                    src="/images/loading.gif"
                    alt="loading gif"
                    width={25}
                    height={25}
                    style={{ marginTop: "15px", marginLeft: "10px" }}
                  />
                )}
              </div>
            </div>

            {refundCCTPStatus.transferFunds.status === true &&
            refundCCTPStatus.transferFunds.loading === false ? (
              <div style={{ marginTop: "20px" }}>
                <button
                  className={styles.backToHomeBtn}
                  onClick={closeRefundCCTPModal}
                >
                  Close
                </button>
              </div>
            ) : null}
          </div>
        </Modal>

        <div style={{ marginLeft: "100px", marginRight: "100px" }}>
          <div
            className={styles.container}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <h2 className={styles.headerText}>
              <div>{`Campaign Details`}</div>
            </h2>
            <div style={{ marginTop: "20px" }}>
              <button className={styles.backToHomeBtn} onClick={goToHomepage}>
                Back to homepage
              </button>
            </div>
          </div>

          <div style={{ display: "flex", marginRight: "40px" }}>
            <div className={styles.detailsContainer}>
              {campaigns.status === "Ended" && (
                <div
                  style={{
                    color: "white",
                    paddingLeft: "25px",
                    paddingTop: "5px",
                    fontSize: "0.9em",
                    marginBottom: "20px",
                  }}
                >
                  {`Status: ${campaigns.status}`}
                </div>
              )}

              <div
                style={{
                  color: "white",
                  paddingLeft: "25px",
                  paddingTop: "5px",
                  fontSize: "0.9em",
                  marginBottom: "20px",
                  //textAlign: "center",
                }}
              >
                {`Campaign created by: ${campaigns.campaignCreator}`}
              </div>

              <div className={styles.imageContainer}>
                <Image
                  src="/images/campaignDetails.jpg"
                  alt="Campaign Image"
                  width={400}
                  height={275}
                />
              </div>

              <h2 className={styles.createCampaignText}>
                <div>{`${campaigns.title}`}</div>
              </h2>
              <div
                style={{
                  color: "grey",
                  paddingLeft: "25px",
                  paddingTop: "5px",
                  fontSize: "0.9em",
                  marginBottom: "20px",
                  //textAlign: "center",
                }}
              >
                {`${campaigns.description}`}
              </div>
            </div>

            <div>
              <div className={styles.details2Container}>
                <h2 className={styles.createCampaignText}>
                  <div>{`Minutes Left`}</div>
                </h2>
                <div
                  style={{
                    color: "grey",
                    paddingLeft: "25px",
                    paddingTop: "5px",
                    fontSize: "0.9em",
                    marginBottom: "20px",
                    //textAlign: "center",
                  }}
                >
                  {campaigns.deadline < 0
                    ? "Campaign ended"
                    : `${campaigns.deadline}`}
                </div>
              </div>
              <div className={styles.details2Container}>
                <h2 className={styles.createCampaignText}>
                  <div>{`Target Amount`}</div>
                </h2>
                <div
                  style={{
                    color: "grey",
                    paddingLeft: "25px",
                    paddingTop: "5px",
                    fontSize: "0.9em",
                    marginBottom: "20px",
                    //textAlign: "center",
                  }}
                >
                  {`${campaigns.targetAmount} USDC`}
                </div>
              </div>

              <div className={styles.details2Container}>
                <h2 className={styles.createCampaignText}>
                  <div>{`Total current Campaign Amount`}</div>
                </h2>
                <div
                  style={{
                    color: "grey",
                    paddingLeft: "25px",
                    paddingTop: "5px",
                    fontSize: "0.9em",
                    marginBottom: "20px",
                    //textAlign: "center",
                  }}
                >
                  {`${campaigns.currentAmount} USDC`}
                </div>
              </div>

              <div className={styles.details2Container}>
                <h2 className={styles.createCampaignText}>
                  <div>{`Your contribution Amount`}</div>
                </h2>
                <div
                  style={{
                    color: "grey",
                    paddingLeft: "25px",
                    paddingTop: "5px",
                    fontSize: "0.9em",
                    marginBottom: "20px",
                    //textAlign: "center",
                  }}
                >
                  {`${campaigns.userContribution} USDC`}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex" }}>
            <div className={styles.depositRefundContainer}>
              <h2 className={styles.headerText}>
                <div>{`Fund Campaign`}</div>
              </h2>
              <div
                style={{
                  color: "grey",
                  paddingLeft: "25px",
                  paddingTop: "5px",
                  fontSize: "0.9em",
                  marginBottom: "20px",
                  //textAlign: "center",
                }}
              >
                {`Fund Campaign with USDC`}
              </div>
              <div style={{ marginLeft: "20px" }}>
                <input
                  type="text"
                  placeholder="Amount (USDC)"
                  onChange={(e) => setUSDCAmount(e.target.value)}
                  value={USDCAmount}
                  style={{
                    padding: "15px",
                    textAlign: "center",
                    display: "block",
                    backgroundColor: "black",
                    color: "white",
                    width: "265px",
                    marginBottom: "10px",
                    borderRadius: "10px",
                  }}
                />
                <button
                  className={styles.fundBtn}
                  onClick={() => depositFunds(false)}
                >
                  Fund Campaign
                </button>
              </div>
              <div style={{ marginLeft: "20px" }}>
                <button
                  className={styles.fundCCTPBtn}
                  onClick={depositFundsCCTP}
                >
                  Fund with USDC from AVAX via CCTP
                </button>
              </div>
            </div>

            <div className={styles.depositRefundContainer}>
              <h2 className={styles.headerText}>
                <div>{`Refund USDC`}</div>
              </h2>
              <div
                style={{
                  color: "grey",
                  paddingLeft: "25px",
                  paddingTop: "5px",
                  fontSize: "0.9em",
                  marginBottom: "20px",
                  //textAlign: "center",
                }}
              >
                {`Refund USDC deposited before campaign ends`}
              </div>
              <div style={{ marginLeft: "20px" }}>
                <button
                  className={styles.refundBtn}
                  onClick={() => refund(false)}
                >
                  Refund
                </button>
              </div>
              <div style={{ marginLeft: "20px" }}>
                <button
                  className={styles.refundCCTPBtn}
                  onClick={refundViaCCTP}
                >
                  Refund to AVAX via CCTP
                </button>
              </div>
            </div>
          </div>

          {campaigns.deadline < 0 &&
            currentWalletAddress.toLowerCase() ===
              campaigns.campaignCreator.toLowerCase() && (
              <div style={{ marginRight: "30px" }}>
                <div
                  className={styles.depositRefundContainer}
                  // style={{ marginRight: "410px" }}
                >
                  <h2 className={styles.headerText}>
                    <div>{`Withdraw Funds`}</div>
                  </h2>
                  <div
                    style={{
                      color: "grey",
                      paddingLeft: "25px",
                      paddingTop: "5px",
                      fontSize: "0.9em",
                      marginBottom: "20px",
                    }}
                  >
                    {`Refund all funds from Campaign`}
                  </div>
                  <div style={{ marginLeft: "20px" }}>
                    <button
                      className={styles.fundBtn}
                      onClick={() => withdrawFunds(false)}
                    >
                      Withdraw USDC
                    </button>
                  </div>

                  <div style={{ marginLeft: "20px" }}>
                    <button
                      className={styles.fundCCTPBtn}
                      onClick={withdrawViaCCTP}
                    >
                      Withdraw USDC Funds to AVAX via CCTP
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </>
  );
}
