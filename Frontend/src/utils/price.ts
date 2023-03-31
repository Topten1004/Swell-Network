import { ethers } from 'ethers';

import chainlinkAggregatorABI from '../shared/abi/ChainlinkAggregator.json';

const chainlinkContractAddress = process.env.REACT_APP_CHAINLINK_DATA_ETH_CONTRACT;

export const getEthPrice = async (): Promise<number> => {
  if (chainlinkContractAddress) {
    const customProvider = new ethers.providers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`
    );
    const chainlinkAggregatorContract = new ethers.Contract(
      chainlinkContractAddress,
      JSON.stringify(chainlinkAggregatorABI),
      customProvider
    );
    const ethPriceInUSD = await chainlinkAggregatorContract.latestAnswer();
    return Number(ethers.utils.formatUnits(ethPriceInUSD, 8));
  }
  return 0;
};
