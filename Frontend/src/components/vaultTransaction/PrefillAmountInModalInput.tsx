import { FC, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from 'web3-react-core';

import { useV3Positions } from '../../hooks/useV3Positions';
import { useVaultDetail } from '../../hooks/useVault';
import PriceInput from '../common/PriceInput';
import { VaultTransactionType } from './VaultTransactionForm';

interface IProps {
  strategyId: number;
  type: VaultTransactionType;
}
const PrefillAmountInModalInput: FC<IProps> = ({ type, strategyId }) => {
  const { account } = useWeb3React();
  const { positions } = useV3Positions(account);
  const { vaultDetail } = useVaultDetail(strategyId, account);
  const { watch, setValue } = useFormContext();
  const selectedPositions = watch('positions');

  const enterBalances: number[] =
    selectedPositions && type === VaultTransactionType.ENTER
      ? positions
          ?.filter((position) => selectedPositions.includes(position.tokenId.toString().split('.')[0]))
          .map((position) => Number(ethers.utils.formatEther(position.baseTokenBalance))) ?? []
      : [0];

  const exitBalances: number[] =
    selectedPositions && type === VaultTransactionType.EXIT
      ? vaultDetail?.positions
          .filter((position) => selectedPositions.includes(position.position.toString().split('.')[0]))
          .map((position) => Number(ethers.utils.formatEther(position.balance)))
      : [0];
  const getBalances = type === VaultTransactionType.ENTER ? enterBalances : exitBalances;
  const amount = Math.min(...(getBalances.length > 0 ? getBalances : [0]));
  useEffect(() => {
    setValue('amount', amount);
  }, [amount, setValue]);
  return (
    <>
      <PriceInput
        adornmentType="node"
        icon="swell"
        maxAmount={amount ? BigNumber.from(amount) : BigNumber.from(0)}
        name="amount"
        tooltip="Must be at least 1 swETH and must be an integer(whole number)"
      />
    </>
  );
};

export default PrefillAmountInModalInput;
