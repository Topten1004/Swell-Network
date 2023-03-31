import { setAPRStats, setGetAPRError, setLoadingAPR } from '../state/stats/statsSlice';
import { store } from '../state/store';
import calculateStakingRewards from './calculateStakingRewards';
import queryBeaconchain from './queryBeaconchain';

const getAPR = async (): Promise<string> => {
  store.dispatch(setGetAPRError(false));
  store.dispatch(setLoadingAPR(true));

  const response = await queryBeaconchain();

  if (response.error) {
    store.dispatch(setGetAPRError(true));
    store.dispatch(setLoadingAPR(false));
    return '';
  }

  const stakedEthAmount = response.totalvalidatorbalance;
  const currentAPR = calculateStakingRewards({ totalAtStake: stakedEthAmount });
  const formattedAPR = (Math.round(currentAPR * 1000) / 10).toLocaleString();

  store.dispatch(setAPRStats(formattedAPR));
  store.dispatch(setLoadingAPR(false));

  return formattedAPR;
};

export default getAPR;
