export enum VaultStatus {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

export enum VaultType {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
}

export interface IVault {
  name?: string;
  type?: VaultType;
  status?: VaultStatus;
  totalAssets?: number;
  apy?: number;
  totalInvestment?: number;
  availableToEnter?: number;
  averageAPR?: number;
  tokenId: string;
  address: string;
}
