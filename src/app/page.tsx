"use client";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { ethers } from "ethers";
import styles from "../../styles/Home.module.css";
import React, { useEffect, useState } from "react";

import campaignManagerABI from "../../utils/campaignABIs/campaignManager.json";

export type Campaign = {
  title: string;
  description: string;
  campaignSCAddress: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  userContribution: number;
  status: string;
  campaignCreator: string;
};

export default function Home() {
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>("");
  const campaignManagerContractAddress =
    process.env.NEXT_PUBLIC_SMART_CONTRACT_ADDRESS;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCampaigns =
    searchQuery === ""
      ? campaigns
      : campaigns.filter((campaign) => {
          const nameMatch = campaign.title.toLowerCase().includes(searchQuery);
          const descriptionMatch = campaign.description
            .toLowerCase()
            .includes(searchQuery);
          return nameMatch || descriptionMatch;
        });

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
    await getAllCampaigns();
  }

  async function getAllCampaigns() {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      //(1) Create Campaign Manager contract instance
      const campaignManagerContractInstance = new ethers.Contract(
        campaignManagerContractAddress as string,
        campaignManagerABI,
        signer
      );
      //(2) call getCampaigns function to get all the campaign contract addresses
      const allCampaignAddresses =
        await campaignManagerContractInstance.getCampaigns();
      //(3) call getCampaignData function to get all detailed data of each campaign
      const allCampaignData =
        await campaignManagerContractInstance.getCampaignData(
          allCampaignAddresses
        );
      // declare new array
      let new_campaign = [];

      // (4) iterate the array and add it into the state variable for display
      for (let i = 0; i < allCampaignData.description.length; i++) {
        let title: string = allCampaignData.title[i];
        let description: string = allCampaignData.description[i];
        let campaignSCAddress: string = allCampaignAddresses[i];
        let targetAmount: string = allCampaignData.targetAmount[i];
        let currentAmount: string = allCampaignData.currentAmount[i];
        let deadline: string = allCampaignData.deadline[i];
        let userContribution: string = allCampaignData.userContribution[i];
        let status: string = allCampaignData.status[i];
        let proposer: string = allCampaignData.proposer[i];

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
        new_campaign.push(newItem);
      }

      // (5) set accounts items to state variable
      setCampaigns(new_campaign);
    }
  }

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

  useEffect(() => {
    connectWallet();
  }, []);
  return (
    <>
      <Head>
        <title>Crowd fund Application</title>

        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/images.png" />
      </Head>

      <div className={styles.background}>
        <div className={styles.topPanel}>
          <div className={styles.walletAddress}>{`Crowd-Fund App`}</div>
          <div
            className={styles.walletAddress}
          >{`Wallet Address: ${currentWalletAddress}`}</div>
        </div>

        <div style={{ marginLeft: "100px", marginRight: "100px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <input
              type="text"
              placeholder="Search by Campaign"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className={styles.searchBar}
            />

            <div>
              <Link
                href={`/createCampaign?managerAddress=${campaignManagerContractAddress}`}
              >
                <button className={styles.createCampaignBtn}>
                  Create a Campaign
                </button>
              </Link>
            </div>
          </div>

          <h2 className={styles.headerText}>
            <div>{`All Campaigns`}</div>
            <div>
              {campaigns.length === 0 ? (
                <div className={styles.homePageEmptyContainer}>
                  <h2
                    className={styles.createCampaignText}
                    style={{ textAlign: "center" }}
                  >
                    <div>{`No Campaigns created`}</div>
                  </h2>
                  <div
                    style={{
                      color: "white",
                      paddingLeft: "25px",
                      paddingTop: "10px",
                      textAlign: "center",
                    }}
                  >
                    {`Create 1 by clicking on Create button above`}
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {filteredCampaigns.map((campaign) => {
                    return (
                      <>
                        <div className={styles.homePageContainers}>
                          <div className={styles.imageContainer}>
                            <Image
                              src="/images/campaign.jpg"
                              alt="Campaign Image"
                              width={300}
                              height={200}
                            />
                          </div>
                          <h2 className={styles.createCampaignText}>
                            <div>{`${campaign.title}`}</div>
                          </h2>
                          <div
                            style={{
                              color: "grey",
                              paddingLeft: "25px",
                              paddingTop: "10px",
                              fontSize: "0.7em",
                              //textAlign: "center",
                            }}
                          >
                            {`${campaign.description}`}
                          </div>

                          <div
                            style={{
                              color: "grey",
                              paddingLeft: "25px",
                              paddingTop: "10px",
                              fontSize: "0.7em",
                              //textAlign: "center",
                            }}
                          >
                            {campaign.deadline < 0
                              ? "Minutes Left: Campaign ended"
                              : `Minutes Left: ${campaign.deadline}`}
                          </div>
                          <div
                            style={{
                              color: "white",
                              paddingLeft: "25px",
                              paddingTop: "10px",
                              fontSize: "0.7em",
                              //textAlign: "center",
                            }}
                          >
                            {`Target Amount: ${campaign.targetAmount} USDC`}
                          </div>
                          <div className={styles.homePageButtonContainer}>
                            <Link
                              href={`/campaignDetails?managerAddress=${campaignManagerContractAddress}&address=${campaign.campaignSCAddress}`}
                            >
                              <button
                                className={styles.goToCreateCampaignPageBtn}
                              >
                                View
                              </button>
                            </Link>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </div>
              )}
            </div>
          </h2>
        </div>
      </div>
    </>
  );
}
