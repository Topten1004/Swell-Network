// eslint-disable-next-line import/prefer-default-export
export const BACKEND_SERVER_URL = process.env.REACT_APP_SWELL_BACKEND_URI;

if (typeof BACKEND_SERVER_URL === 'undefined') {
  throw new Error(`REACT_APP_SWELL_BACKEND_URI must be a defined environment variable`);
}

export const subgraphEndPointUrl: any = {
  1:
    process.env.REACT_APP_SWELL_SUBGRAPH_MAIN_API ||
    'https://api.studio.thegraph.com/query/29875/swellnetwork-mainnet/v0.0.4',
  5: process.env.REACT_APP_SWELL_SUBGRAPH_API || 'https://api.studio.thegraph.com/query/29875/swellnetwork/v0.3.0',
};
