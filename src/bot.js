import cron from 'node-cron';
import { ethers } from 'ethers';
import { request, gql } from 'graphql-request';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import rout from './router.json' assert { type: 'json' };
dotenv.config();

// Set global fetch
globalThis.fetch = fetch;

// Connect to Base L2 provider
const provider = new ethers.JsonRpcProvider(process.env.BASE_L2_RPC_URL);

// Placeholder: DEX Router address and ABI (replace with actual DEX router details)
const routerAddress = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; // Example DEX router address
const routerABI = rout;

const routerContract = new ethers.Contract(routerAddress, routerABI, provider);

// Function to fetch token price
const fetchTokenPrice = async (tokenAddress) => {
  try {
    // Example function to get token price from a DEX
    const amountsOut = await routerContract.getAmountsOut(
      ethers.parseUnits("1", 18), 
      [tokenAddress, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]
    );
    const tokenPriceInETH = amountsOut[1];
    return tokenPriceInETH;
  } catch (error) {
    console.error("Error fetching token price: ", error);
    return null;
  }
};

// Example token address (replace with actual token addresses for monitoring)
const tokenAddress = "0x6982508145454Ce325dDbE47a25d4ec3d2311933";

// Example query to fetch liquidity pool data
const query = gql`
  {
    pools(where: { token0: "${tokenAddress}" }) {
      id
      volumeUSD
    }
  }
`;

const fetchVolumeData = async () => {
  try {
    const endpoint = "https://gateway.thegraph.com/api/5cfffe520a01442a27ae84c9f4b333a6/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV"; // Example endpoint
    const data = await request(endpoint, query);
    if (data.pools.length > 0) {
      const volumeUSD = data.pools[0].volumeUSD;
      return volumeUSD;
    }
    return null;
  } catch (error) {
    console.error("Error fetching volume data: ", error);
    return null;
  }
};

// Initialize previous values
let previousPrice = null;
let previousVolume = null;

// Monitor market conditions
const monitorMarket = async () => {
  try {
    console.log("Monitoring market conditions...");

    // Fetch token price and volume data
    const currentPrice = await fetchTokenPrice(tokenAddress);
    const currentVolume = await fetchVolumeData();

    if (currentPrice && currentVolume) {
      console.log(`Current Price: ${ethers.formatUnits(currentPrice, 18)} ETH, Current Volume: ${currentVolume} USD`);

      // Compare with previous data to detect price change and volume spike
      if (previousPrice !== null && previousVolume !== null) {
        const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
        const volumeChange = ((currentVolume - previousVolume) / previousVolume) * 100;

        console.log(`Price Change: ${priceChange.toFixed(2)}%`);
        console.log(`Volume Change: ${volumeChange.toFixed(2)}%`);

        // Trigger buy/sell or liquidity actions based on conditions
        if (priceChange >= 15 && volumeChange >= 15) {
          console.log("Price and volume spike detected! Triggering action...");
          // TODO: Add logic for buying, selling, or adding/removing liquidity
        }
      }

      // Update previous price and volume for next comparison
      previousPrice = currentPrice;
      previousVolume = currentVolume;
    }
  } catch (error) {
    console.error("Error during market monitoring: ", error);
  }
};

// Schedule the bot to run every minute
cron.schedule('* * * * *', () => {
  monitorMarket();
});

console.log("Bot is running...");
