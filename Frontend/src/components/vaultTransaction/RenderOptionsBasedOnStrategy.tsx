import { useEffect, useState } from 'react';

import { useLazyQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { useWeb3React } from 'web3-react-core';

import { useV3Positions } from '../../hooks/useV3Positions';
import { useVaultDetail } from '../../hooks/useVault';
import { GET_NODE_OPERATOR_BY_VALIDATOR } from '../../shared/graphql';
import { useIsMounted } from '../../utils/useIsMounted';
import MultiSelect from '../common/MultiSelect';
import IOption from '../modal/liquidityTransactionModal/IOption';
import { VaultTransactionType } from './VaultTransactionForm';

interface IProps {
  type: VaultTransactionType;
  strategyId: number;
}
const RenderOptionsBasedOnStrategy: React.FC<IProps> = ({ type, strategyId }) => {
  const { account } = useWeb3React();

  const [fetchPositionData] = useLazyQuery(GET_NODE_OPERATOR_BY_VALIDATOR);
  const isMounted = useIsMounted();

  const [enterOptions, setEnterOptions] = useState<IOption[]>([]);

  const { positions, loading: enterLoading } = useV3Positions(account);
  const enterPositions =
    positions?.filter((position) => Number(ethers.utils.formatEther(position.baseTokenBalance)) > 0) || [];

  const { vaultDetail } = useVaultDetail(strategyId, account);
  const exitOptions = vaultDetail?.positions.map((position) => position.position.toString()) || [];

  const fetchData = (id: number) => {
    if (enterPositions && id < enterPositions?.length) {
      fetchPositionData({
        variables: {
          pubKey: enterPositions[id].pubKey,
        },
        onCompleted(data) {
          const tempOptions = enterOptions;
          tempOptions[id] = {
            label:
              enterPositions[id].tokenId.toString() +
              (data.nodeOperatorByValidator ? String(' - ') + data.nodeOperatorByValidator.name : ''),
            value: enterPositions[id].tokenId.toString(),
            logo: data.nodeOperatorByValidator?.logo,
          };
          setEnterOptions(tempOptions);
          setTimeout(() => {
            if (isMounted()) fetchData(id + 1);
          }, 0);
        },
      });
    }
  };

  useEffect(() => {
    if (!enterLoading) {
      fetchData(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterLoading]);

  return (
    <>
      <MultiSelect
        label={type === VaultTransactionType.ENTER ? 'Choose positions to enter' : 'Choose positions to exit'}
        name="positions"
        options={type === VaultTransactionType.ENTER ? enterOptions : exitOptions}
        placeholder={type === VaultTransactionType.ENTER ? 'Choose positions to enter' : 'Choose positions to exit'}
      />
    </>
  );
};
export default RenderOptionsBasedOnStrategy;
