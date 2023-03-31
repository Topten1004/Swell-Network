# Swell Network Frontend

UI for Swell Network, re-uses most of UniswapV3 frontend code features like wallet connectivity, positions fetching, swNFT mint & display, positions detail, deposit/withdraw swEth. And some additional features like node operator registration flow, Eth staking, vaults with enter/exit features. The UI is fully integrated with the underlying smart contracts and communicates with the backend graphql API.

## Tools Dependencies

- node v16.14.2 (built and deployed with)
- [yarn](https://yarnpkg.com/cli/install)

## Installation Process

- Please ensure following environment variables are set
  - REACT_APP_INFURA_KEY
  - REACT_APP_FORTMATIC_KEY
  - REACT_APP_CHAINLINK_DATA_ETH_CONTRACT
  - REACT_APP_KALEIDO_CHAIN_ID
  - REACT_APP_KALEIDO_RPC_URL
  - REACT_APP_MAINNET_MULTICALL_ADDRESS
  - REACT_APP_GOERLI_MULTICALL_ADDRESS
  - REACT_APP_KALEIDO_MULTICALL_ADDRESS
  - REACT_APP_DEFAULT_NETWORK_MOBILE
  - REACT_APP_DEFAULT_NETWORK_DESKTOP
  - REACT_APP_PORTIS_ID
  - REACT_APP_SWELL_GRAPHQL_URI
  - REACT_APP_BYPASS_POAP
  - REACT_APP_DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID
  - REACT_APP_MAINNET_SWNFT_ADDRESS
  - REACT_APP_GOERLI_SWNFT_ADDRESS
  - REACT_APP_KALEIDO_SWNFT_ADDRESS
  - REACT_APP_MAINNET_SWETH_ADDRESS
  - REACT_APP_GOERLI_SWETH_ADDRESS
  - REACT_APP_KALEIDO_SWETH_ADDRESS
  - REACT_APP_MAINNET_POAP_ADDRESS
  - REACT_APP_GOERLI_POAP_ADDRESS
  - REACT_APP_KALEIDO_POAP_ADDRESS
  - REACT_APP_COINBASE_MOBILE_UNIVERSAL_LINK
- In the projects root directory run `yarn` from the terminal to install all the dependencies for the project.
- Start the project by running `yarn start`.
- Or just build the project by running `yarn build`.

## Deployment on Firebase

- Firebase configuration is already added to the project root in `firebase.json`.
- Make sure that [firebase CLI](https://firebase.google.com/docs/cli#install_the_firebase_cli) is installed on your machine.
- If firebase hasn't been already initialized, run `firebase init` and connect to the firebase project where the app is hosted on.
- We currently have two hosting:
  - dev
  - main
- To deploy on dev hosting
  - checkout to `dev` branch
  - run `yarn build` first
  - run `firebase deploy --only hosting:dev-swell-network-frontend`
  - Fresh deployment will be sent to the [dev](https://testnet.swellnetwork.io/) url.
- To deploy on main hosting
  - checkout to `main` branch
  - run `yarn build` first
  - run `firebase deploy --only hosting:swell-network-frontend`
  - Fresh deployment will be sent to the [main](https://app.swellnetwork.io/) url.

## CI/CD Pipeline

The Project is using Github Actions to automate CI/CD workflows, the build process reads and maps all the secrets defined under **Settings** > **Secrets** > **Actions** > **Actions Secrets** to the required environment variables in the react app. The deploy process uses the `GCP_SA_KEY` which is the service account key retreived from firebase from [this](https://console.firebase.google.com/project/swell-network-20953/settings/serviceaccounts/adminsdk) location.

### Dependencies to run pipeline smoothly

- Ensure `GCP_SA_KEY` secret is defined under **Settings** > **Secrets** > **Actions** > **Actions Secrets**
- Ensure that the build stage secrets that are mapped to react environment variables are defined. A word of Caution! the pipeline will run successfully even if those variables are not defined as it will take an empty value for that. It's the hosted environment that will not work if the variables don't have the correct value.
- Code is _pushed-to_ or _merged-into_ the right trigger branch (dev/main).

## Github Secrets for Build Stage

Please ensure that the following secrets are defined for the app to run smoothly:

- Common Secrets
  - REACT_APP_INFURA_KEY
  - REACT_APP_FORTMATIC_KEY
  - REACT_APP_CHAINLINK_DATA_ETH_CONTRACT
  - REACT_APP_KALEIDO_CHAIN_ID
  - REACT_APP_KALEIDO_RPC_URL
  - REACT_APP_MAINNET_MULTICALL_ADDRESS
  - REACT_APP_GOERLI_MULTICALL_ADDRESS
  - REACT_APP_KALEIDO_MULTICALL_ADDRESS
  - REACT_APP_DEFAULT_NETWORK_MOBILE
  - REACT_APP_DEFAULT_NETWORK_DESKTOP
- Dev branch secrets
  - REACT_APP_PORTIS_ID_DEV
  - REACT_APP_SWELL_GRAPHQL_URI_DEV
  - REACT_APP_SWELL_BACKEND_URI_DEV
  - REACT_APP_BYPASS_POAP_DEV
  - REACT_APP_DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID_DEV
  - REACT_APP_MAINNET_SWNFT_ADDRESS_DEV
  - REACT_APP_GOERLI_SWNFT_ADDRESS_DEV
  - REACT_APP_KALEIDO_SWNFT_ADDRESS_DEV
  - REACT_APP_MAINNET_SWETH_ADDRESS_DEV
  - REACT_APP_GOERLI_SWETH_ADDRESS_DEV
  - REACT_APP_KALEIDO_SWETH_ADDRESS_DEV
  - REACT_APP_MAINNET_POAP_ADDRESS_DEV
  - REACT_APP_GOERLI_POAP_ADDRESS_DEV
  - REACT_APP_KALEIDO_POAP_ADDRESS_DEV
  - REACT_APP_COINBASE_MOBILE_UNIVERSAL_LINK_DEV
- Main branch secrets
  - REACT_APP_PORTIS_ID_MAIN
  - REACT_APP_SWELL_GRAPHQL_URI_MAIN
  - REACT_APP_SWELL_BACKEND_URI_MAIN
  - REACT_APP_BYPASS_POAP_MAIN
  - REACT_APP_DEFAULT_SWELL_NETWORK_NODE_OPERATOR_ID_MAIN
  - REACT_APP_MAINNET_SWNFT_ADDRESS_MAIN
  - REACT_APP_GOERLI_SWNFT_ADDRESS_MAIN
  - REACT_APP_KALEIDO_SWNFT_ADDRESS_MAIN
  - REACT_APP_MAINNET_SWETH_ADDRESS_MAIN
  - REACT_APP_GOERLI_SWETH_ADDRESS_MAIN
  - REACT_APP_KALEIDO_SWETH_ADDRESS_MAIN
  - REACT_APP_MAINNET_POAP_ADDRESS_MAIN
  - REACT_APP_GOERLI_POAP_ADDRESS_MAIN
  - REACT_APP_KALEIDO_POAP_ADDRESS_MAIN
  - REACT_APP_COINBASE_MOBILE_UNIVERSAL_LINK_MAIN

### Branch Suffixes

The branch suffixes e.g. `_DEV` and `_MAIN` have been added to the secrets to map them to `dev` and `main` branch respectively.

## Project setup on Kaleido

- If not already deployed, please deploy WETH9 contract on kaleido chain. The contract can be found [here](https://github.com/gnosis/canonical-weth/blob/master/contracts/WETH9.sol)
- Keep a note of the address where this contract is deployed at. It will be passed with `-w9` parameter to the command that we are going to setup next.
- Clone [Uniswap/deploy-v3](https://github.com/Uniswap/deploy-v3) repository on your local machine.
- Inside the cloned repository code specifically the root of the folder, run `yarn` to install all the dependencies.
- Check if there is any `state.json` file at the root, if found rename it to something else like `state-backup1.json`. The `state.json` file contains the deployed contract addresses, if it already exists that means the contracts are already deployed and the deploy command will not work. So make sure you remove that.
- In the `index.ts` file at the root of the project change line 93 where wallet instance is being created, we need to make some changes. Now since kaleido rpc url causes issues with wallets we need to replace.

  ```ts
  const wallet = new Wallet(program.privateKey, new JsonRpcProvider({ url: url.href }));
  ```

  With

  ```ts
  // sample rpc url: https://user:password@hostname
  const wallet = new Wallet(
    program.privateKey,
    new JsonRpcProvider({
      url: 'hostname',
      user: 'user',
      password: 'password',
    })
  );
  ```

- Save `index.ts`.
- Run this command at project root in terminal:
  ```sh
  npx ts-node index.ts -pk <owner-public-key> -j <RPC-URLS-in-quotes> -w9 <Weth9 Address> -ncl ETH -o <owner-addr>
  ```
  **Note:** that here `-j` is mandatory as per `deploy-v3` code, since we replaced the default JsonRpcProvider parameter with our kaleido specific parameter, simple pass the complete RPC URL here for kaleido and it will be overridden internally.
- Check the newly created `state.json` file for the deployed contract addresses. It would look something like this:
  ```json
  {
    "v3CoreFactoryAddress": "0x433EE89EC5766038b3a70a50d56D38AFCDc12130",
    "multicall2Address": "0x3D6785D8E1535Efa46A507638F7E92dD2E33ca17",
    "proxyAdminAddress": "0xa3d26E29b5B133669E4C0C171e35f226639D7Cde",
    "tickLensAddress": "0xe0C8df4270F4342132ec333F6048cb703E7A9c77",
    "nftDescriptorLibraryAddressV1_3_0": "0x0F646E419adA65e924fd77c7A5a53cB31579900B",
    "nonfungibleTokenPositionDescriptorAddressV1_3_0": "0x37e487b233b440673a75Da0d5e28d7fA16F41c67",
    "descriptorProxyAddress": "0x44193eDaC2158b6d7D67F311C6df7421e12f4Fce",
    "nonfungibleTokenPositionManagerAddress": "0x09930dEb4019b3F3de0f66704d6639BDd1ed7B75",
    "v3MigratorAddress": "0x636C2eB4608a79DAAA1E8DF37A83f3a12F136041",
    "v3StakerAddress": "0xF2E0569F229e24dd2C51a3f366938a4493139d12",
    "quoterV2Address": "0xF5fECA644F7eFC9835e64C5eFFe1A8167d5776F2",
    "swapRouter02": "0xBf1dE82E06FCF76bDABeB95B4162Ca97F4B494E8"
  }
  ```
- Copy the value for multicall2Address key and set the common secret `REACT_APP_KALEIDO_MULTICALL_ADDRESS` under **Settings** > **Secrets** > **Actions** > **Actions Secrets** with the value.
- Deploy swell core smart contracts and pass the addresses in the associated address secrets:

  - REACT_APP_KALEIDO_SWNFT_ADDRESS_DEV
  - REACT_APP_KALEIDO_SWETH_ADDRESS_DEV
  - REACT_APP_KALEIDO_POAP_ADDRESS_DEV
  - REACT_APP_KALEIDO_SWNFT_ADDRESS_MAIN
  - REACT_APP_KALEIDO_SWETH_ADDRESS_MAIN
  - REACT_APP_KALEIDO_POAP_ADDRESS_MAIN

  For Dev or Main branch whichever we are targetting.

- Set other Kaleido specific common secrets
  - REACT_APP_KALEIDO_CHAIN_ID
  - REACT_APP_KALEIDO_RPC_URL
