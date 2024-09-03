import { request, gql } from 'graphql-request';

// Example query to fetch liquidity pool data
const query = gql`
  {
   pools(first: 20, orderBy: volumeUSD, orderDirection: desc) {
    id
    liquidity
    volumeUSD
    feeTier
  }
  }
`;

const fetchPoolData = async () => {
  try {
    const endpoint = "https://gateway.thegraph.com/api/5cfffe520a01442a27ae84c9f4b333a6/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV"; 
    const data = await request(endpoint, query);
    console.log(data);
  } catch (error) {
    console.error("Error fetching liquidity pool data: ", error);
  }
};

// Call the function to fetch liquidity data
fetchPoolData();
