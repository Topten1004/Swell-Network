import axios from 'axios';

type BeaconchainResponse = {
  data: {
    status: string;
    data: {
      validatorscount: number;
      totalvalidatorbalance: number; // gwei
    };
  };
};

type BeaconchainInfo = {
  totalvalidatorbalance: number;
  error: string | null;
};

const queryBeaconchain = async (): Promise<BeaconchainInfo> => {
  try {
    const response: BeaconchainResponse = await axios.get(`https://mainnet.beaconcha.in/api/v1/epoch/latest`);
    let ethBalance = response.data.data.totalvalidatorbalance * 1e-9;
    ethBalance = +ethBalance.toFixed(0);
    return {
      totalvalidatorbalance: ethBalance,
      error: null,
    };
  } catch (error: any) {
    return {
      totalvalidatorbalance: 0,
      error: error.message,
    };
  }
};

export default queryBeaconchain;
