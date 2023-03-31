import { useSingleCallResult } from '../lib/hooks/multicall';
import { usePOAPContract } from './useContract';

interface UsePOAPBalanceResult {
  loading: boolean;
  balance: number | undefined;
}

// eslint-disable-next-line import/prefer-default-export
export function usePOAPBalance(account: string | null | undefined): UsePOAPBalanceResult {
  const POAPContract = usePOAPContract();

  const { loading: balanceLoading, result: balanceResult } = useSingleCallResult(POAPContract, 'balanceOf', [
    account ?? undefined,
  ]);

  // we don't expect any account balance to ever exceed the bounds of max safe int
  const accountBalance: number | undefined = balanceResult?.[0]?.toNumber();

  return {
    loading: balanceLoading,
    balance: accountBalance,
  };
}
