export interface IServerDetails {
  location: string;
  cpu: number;
  ram: number;
  network: number;
  storage: number;
  nodes: number;
  executionLayerClients: string;
  consensusLayerClients: string;
}

export interface IOperatorDetails {
  category: string;
  name: string;
  yearsOfExperience: number;
  email: string;
  website: string;
  social: string;
  description: string;
  logo: string;
}

export interface IOperatorRate {
  rate?: string;
}

export interface INodeOperatorDepositData {
  id: number;
  amount: number;
  signature: string;
  depositDataRoot: string;
}
export interface INodeOperatorValidator {
  id: number;
  status: boolean;
  pubKey: string;
  depositDatas: Partial<INodeOperatorDepositData>[];
  depositBalance: string;
}

export interface INodeOperator extends IOperatorDetails, IServerDetails, IOperatorRate {
  id?: number;
  availableStakingAmount?: number;
  validators?: INodeOperatorValidator[];
  verified: boolean;
}
