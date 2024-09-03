import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

// Connect to the Base L2 network using the RPC URL from the .env file
const provider = new ethers.JsonRpcProvider(process.env.BASE_L2_RPC_URL);

// Function to fetch the current block number
const getBlockNumber = async () => {
  try {
    const blockNumber = await provider.getBlockNumber();
    console.log("Current Block Number: ", blockNumber);
  } catch (error) {
    console.error("Error fetching block number: ", error);
  }
};

// Call the function to fetch the block number
getBlockNumber();
