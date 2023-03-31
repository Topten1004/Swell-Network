# Swell Betwork Backend
NodeJS + Express API

## Tech
- NodeJS + Express
- Graphql
- Postgresql
- Prisma
- Cronjob

## Pre-requirements
Docker and docker-compose should be installed on local machine.

## Installation
This backend requires [Node.js](https://nodejs.org/) v10+ to run.
Install the dependencies and devDependencies.

```sh
cd backend
npm i
```

## Setup Environment
Create a new file ".env" and set these variables.
```
RPC_URL=https://goerli.infura.io/v3/
KALEIDO_NODE_URL=https://a0gen4pcmz-a0ni4dzezs-rpc.au0-aws.kaleido.io/
KALEIDO_NODE_USER=a0ecsn70tn
KALEIDO_NODE_PASSWORD=3BR1DQV5Wwj2-LB9EXuFp88iuhWZ76NUkhBlrGko7Pg
KALEIDO_SWNFT_ADDRESS=0xF60e61765fA8d038a00f4a647676Cb21E6d3F2b2
CURRENT_NETWORK=KALEIDO
```

## Development
- Run postgres database using docker-compose
```
1. install docker desktop or docker
2. install docker-compose
3. set up variables in .env
4. run npm install docker run -v $(pwd):/usr/src/app -w /usr/src/app node:16 npm install
5. docker-compose up -d
```
- Run node app using the command in the below
```
npm run start
```

- Run migration
```
npm run migrate:dev
```