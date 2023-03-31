import { FC, useState } from 'react';

import { ExpandMore } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardContent,
  CardHeader,
  styled,
  Typography,
} from '@mui/material';

const LinkButton = styled('a')(() => ({
  color: '#00B0F0',
  border: '0px',
  background: 'transparent',
  '&:hover': {
    color: '#0068A0',
    textDecoration: 'underline',
  },
  '&:active': {
    color: '#DDDDDD',
    textDecoration: 'underline',
  },
}));

const FAQs: { question: string; answer: FC }[] = [
  {
    question: 'What is Swell Network?',
    answer: () => (
      <Typography>
        Swell Network is a permissionless, non-custodial, and liquid ETH staking protocol built for stakers, node
        operators, and the Ethereum ecosystem.
      </Typography>
    ),
  },
  {
    question: 'How does Swell work?',
    answer: () => (
      <>
        <Typography>
          Swell works as a marketplace for stakers and node operators to earn rewards from running validators to attest
          transactions and propose blocks on the Ethereum{' '}
          <LinkButton href="https://ethereum.org/en/upgrades/beacon-chain/" rel="noopener noreferrer" target="_blank">
            Beacon Chain
          </LinkButton>
          .
        </Typography>
        <Typography>
          Stakers choose a node operator and deposit their ETH directly with their validator to earn ETH staking
          rewards, minus any penalties and protocol fees and receive in return a liquid staking derivative token called
          swETH which is a 1:1 representation of their staked ETH.
        </Typography>
        <Typography>
          Node operators with the technical expertise and infrastructure are able to register and set up validators with
          Swell in order to attract stakers to fill the 32 ETH requirement to run a validator. This is done in a
          permissionless manner and requires 16 ETH as collateral.
        </Typography>
        <Typography>
          Institutional blockchain infrastructure providers are also able to register with Swell to provide validation
          services to stakers with 1 ETH as collateral. This will however require being verified by the Swell Network
          DAO.
        </Typography>
      </>
    ),
  },
  {
    question: 'Which node operator should I select?',
    answer: () => (
      <>
        <Typography>
          The choice of node operators to stake with depends on what factors are more important to you namely;
        </Typography>
        <Typography> &nbsp;&nbsp; - Yield</Typography>
        <Typography> &nbsp;&nbsp; - Trust in experience</Typography>
        <Typography> &nbsp;&nbsp; - Brand recognition</Typography>
      </>
    ),
  },
  {
    question: 'What is swETH?',
    answer: () => (
      <Typography>
        A Swell ETH (swETH) is a liquid staking derivative token representing staked ETH. swETH is redeemable on a 1:1
        basis with ETH post merge.
      </Typography>
    ),
  },
  {
    question: 'What is swNFT?',
    answer: () => (
      <Typography>
        A Swell NFT (swNFT) is a financial NFT that gets minted when ETH is staked with a node operator’s validator. It
        functions as the proof of a user’s stake with a validator and is used to calculate ETH staking rewards when
        un-staking and redeeming ETH.
      </Typography>
    ),
  },
  {
    question: 'How is Swell different from other liquid staking protocols?',
    answer: () => (
      <>
        <Typography>
          Swell has made a number of innovations to make liquid staking more robust and decentralised namely;
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>Atomic deposits</span> - A financial NFT representing tangible proof of a
          user’s stake with a validator that separates the asset (swETH) and its income (staking rewards). This provides
          users more flexibility when making use of swETH in the De-Fi ecosystem.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>swNFT</span> - This enable users to stake directly with a node operator’s
          validator. This means that they are in complete control of who they are staking with.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>Swell vaults</span> - swETH deposited in Swell vaults earn extra yield
          for the user and operates much like{' '}
          <LinkButton href="https://yearn.finance/" rel="noopener noreferrer" target="_blank">
            Yearn
          </LinkButton>{' '}
          vaults bringing the De-Fi ecosystem conveniently into the Swell staking experience.
        </Typography>
        <Typography>
          <LinkButton href="https://ssv.network/" rel="noopener noreferrer" sx={{ fontWeight: 'bold' }} target="_blank">
            SSV Network
          </LinkButton>{' '}
          - Node operators running SSV technology will be able reduce their collateral requirements to 1 ETH per
          validator and get permissionless entry to the protocol. SSV Network operators bring more decentralisation to
          the Ethereum ecosystem and lower redundancy and fault tolerance for the staker.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>White labelled liquid staking</span> - External parties are able to build
          on top of the Swell protocol, run their own validators and use their unique branding and business models to
          offer liquid staking exclusively to their customers and earn ETH staking rewards.
        </Typography>
      </>
    ),
  },
  {
    question: 'Is Swell safe to stake with?',
    answer: () => (
      <>
        <Typography>The following outlines Swell’s measures when it comes to security;</Typography>
        <Typography> &nbsp;&nbsp; - The protocol is non-custodial, minimising counter-party risk.</Typography>
        <Typography>
          &nbsp;&nbsp; - The code is open-sourced and Swell is covered by{' '}
          <LinkButton href="https://immunefi.com/" rel="noopener noreferrer" target="_blank">
            Immunefi’s
          </LinkButton>{' '}
          bug bounty program.
        </Typography>
        <Typography>
          &nbsp;&nbsp; - Swell is committed to continuously{' '}
          <LinkButton
            href="https://github.com/SwellNetwork/v2-core-public/tree/main/Audit%20Reports"
            rel="noopener noreferrer"
            target="_blank"
          >
            audit
          </LinkButton>{' '}
          its smart contracts.
        </Typography>
        <Typography>
          &nbsp;&nbsp; - Staking risk for stakers is minimised by requiring collateral from node operators.
        </Typography>
        <Typography>
          &nbsp;&nbsp; - Penalty and slashing risk is minimised by on-chain cover provided by{' '}
          <LinkButton href="https://unslashed.finance/" rel="noopener noreferrer" target="_blank">
            Unslashed
          </LinkButton>
        </Typography>
      </>
    ),
  },
  {
    question: 'What are the risks of staking with Swell?',
    answer: () => (
      <>
        <Typography>
          In general there are a number of potential risks that exist when staking ETH with any liquid staking protocol.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>Smart contract risk</span> - There is an inherent risk that Swell’s smart
          contracts could contain a bug or a vulnerability. These are mitigated by smart contract audits and bug bounty
          programs.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>ETH 2.0 technology risk</span> - Swell builds on the Ethereum blockchain
          and would naturally inherit the risks of the underlying technology which may contain bugs and vulnerabilities.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>Penalty and slashing risk</span> - Validators run by node operators are
          at risk of penalties and slashing by the Ethereum Beacon Chain for missed attestations or fulfilling a
          slashing condition. These can result in up to 100% of staked ETH being at risk over a period of time. Swell
          mitigates this by providing access to reputable and professional node operators, collateral requirements and
          insurance cover.
        </Typography>
        <Typography>
          <span style={{ fontWeight: 'bold' }}>swETH price fluctuations</span> - The price of the swETH token on the
          secondary markets can be subject to price fluctuations to below the ETH price when markets are over supplied
          with swETH. This however does not dilute from the stable 1:1 primary market price when a redemption is made
          from the Beacon Chain.
        </Typography>
      </>
    ),
  },
  {
    question: 'What are the protocol fees applied by Swell?',
    answer: () => (
      <Typography>
        Swell applies a 5 - 15% commission on staking rewards earned from the Beacon Chain. The Swell Network DAO
        treasury retains a fixed 5% fee while the remainder of the commission is variable from 0% up to 10% and is at
        the discretion of the node operator.
      </Typography>
    ),
  },
  {
    question: 'How do I un-stake?',
    answer: () => (
      <>
        <Typography>
          Un-staking (redeeming swETH for ETH from the blockchain) will be available at the earliest 6 months after the
          merge for all users staking on the Beacon Chain. After that time there will be a rollout of withdrawals
          meaning redemptions may be unavailable for some users for an undetermined amount of time until it is
          completed. For more information please visit the official Ethereum{' '}
          <LinkButton href="https://ethereum.org/en/upgrades/" rel="noopener noreferrer" target="_blank">
            site
          </LinkButton>
          .
        </Typography>
        <Typography>
          swETH however will be freely available to be traded on the secondary markets to provide liquidity to stakers
          during this period.
        </Typography>
      </>
    ),
  },
];

const Faq: React.FC = () => {
  const [loadMore, setLoadMore] = useState<boolean>(true);

  const handleLoadMore = (load: boolean) => {
    setLoadMore(load);
  };
  const faqs = loadMore ? FAQs.slice(0, 2) : FAQs;
  return (
    <Card>
      <CardHeader sx={{ '& span': { marginBottom: 0 } }} title="FAQ" />
      <CardContent>
        {faqs.map((faq) => (
          <Accordion key={faq.question}>
            <AccordionSummary
              expandIcon={
                <ExpandMore
                  sx={{
                    background: (theme) => theme.palette.primary.light,
                    color: (theme) => theme.palette.primary.main,
                    width: 15,
                    height: 15,
                    borderRadius: '50%',
                  }}
                />
              }
            >
              {faq.question}
            </AccordionSummary>
            <AccordionDetails>
              <faq.answer />
            </AccordionDetails>
          </Accordion>
        ))}
        {loadMore ? (
          <Button
            onClick={() => handleLoadMore(false)}
            size="small"
            sx={{ fontWeight: 500, marginTop: '20px', padding: 0 }}
            variant="text"
          >
            View more
          </Button>
        ) : (
          <Button
            onClick={() => handleLoadMore(true)}
            size="small"
            sx={{ fontWeight: 500, marginTop: '20px', padding: 0 }}
            variant="text"
          >
            View less
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Faq;
