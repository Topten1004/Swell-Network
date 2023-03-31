import { useMemo } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { BigNumber } from '@ethersproject/bignumber';
import JSBI from 'jsbi';
import { useSnackbar } from 'notistack';

import { NEVER_RELOAD, useSingleCallResult } from '../lib/hooks/multicall';
import { displayErrorMessage } from '../utils/errors';
import { useSwNftContract } from './useContract';

type TokenId = number | JSBI | BigNumber;

const STARTS_WITH = 'data:application/json;base64,';

export type UsePositionTokenURIResult =
  | {
      valid: true;
      loading: false;
      result: {
        name: string;
        description: string;
        image: string;
      };
    }
  | {
      valid: false;
      loading: false;
    }
  | {
      valid: true;
      loading: true;
    };

// eslint-disable-next-line import/prefer-default-export
export function usePositionTokenURI(tokenId: TokenId | undefined): UsePositionTokenURIResult {
  const contract = useSwNftContract();
  const inputs = useMemo(
    () => [tokenId instanceof BigNumber ? tokenId.toHexString() : tokenId?.toString(16)],
    [tokenId]
  );
  const { result, error, loading, valid } = useSingleCallResult(contract, 'tokenURI', inputs, {
    ...NEVER_RELOAD,
    gasRequired: 3_000_000,
  });
  const { enqueueSnackbar } = useSnackbar();

  return useMemo(() => {
    if (error || !valid || !tokenId) {
      return {
        valid: false,
        loading: false,
      };
    }
    if (loading) {
      return {
        valid: true,
        loading: true,
      };
    }
    if (!result) {
      return {
        valid: false,
        loading: false,
      };
    }
    const [tokenURI] = result as [string];
    if (!tokenURI || !tokenURI.startsWith(STARTS_WITH))
      return {
        valid: false,
        loading: false,
      };

    try {
      const json = JSON.parse(Buffer.from(tokenURI.slice(STARTS_WITH.length), 'base64').toString());

      return {
        valid: true,
        loading: false,
        result: json,
      };
      // eslint-disable-next-line @typescript-eslint/no-shadow
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
      return { valid: false, loading: false };
    }
  }, [error, loading, result, tokenId, valid, enqueueSnackbar]);
}
