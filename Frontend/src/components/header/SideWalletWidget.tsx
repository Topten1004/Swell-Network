import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardHeader,
  CircularProgress,
  Collapse,
  Popover,
  PopoverProps,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { SWETH } from '../../constants/tokens';
import useActiveWeb3React from '../../hooks/useActiveWeb3React';
import { useGetYourPosition } from '../../hooks/useV3Positions';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import {
  setIsDepositLiquidityTransactionModalOpen,
  setIsVaultTransactionModalOpen,
  setIsWalletModalOpen,
  setIsWithdrawLiquidityTransactionModalOpen,
} from '../../state/modal/modalSlice';
import { useNativeCurrencyBalances, useTokenBalance } from '../../state/wallet/hooks';
import { EthereumIcon, SwellIcon } from '../../theme/uiComponents';
import getAPR from '../../utils/getAPR';
import Web3Status from '../common/Web3Status';

const SideBarCard: FC<BoxProps & { cardView?: boolean; title?: string }> = ({ cardView, sx, children, title }) => {
  const matches = useMediaQuery('(max-width: 767px)');
  const [collapse, setCollapse] = useState(matches);

  useEffect(() => {
    setCollapse(matches);
  }, [matches]);

  return cardView ? (
    <Card
      sx={{
        textAlign: 'center',
        background: (theme) => theme.palette.common.white,
        marginBottom: '20px',
        padding: '0px 10px 18px !important',
        '@media only screen and (min-width: 768px) and (max-width: 1200px)': {
          paddingBlock: '0px !important',
          marginBlock: '10px !important',
        },
        '@media only screen and (max-width: 767px)': {
          paddingBlock: '0 !important',
          margin: '0 !important',
        },
        ...sx,
      }}
    >
      <CardHeader
        action={
          matches && (
            <ExpandMore
              onClick={() => setCollapse(!collapse)}
              role="button"
              sx={{
                background: (theme) => theme.palette.primary.light,
                color: (theme) => theme.palette.primary.main,
                width: 20,
                height: 20,
                borderRadius: '50%',
                transition: '.3s',
                transform: collapse ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />
          )
        }
        sx={{
          borderColor: (theme) => theme.palette.grey['300'],
          padding: '9px 20px',
          textAlign: 'center',
          margin: '0 -10px',
          '@media only screen and (max-width: 767px)': {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '9px 10px',
            textAlign: 'left',
          },
          '& .MuiTypography-root': {
            fontSize: 'inherit',
            margin: 0,
          },
        }}
        title={title}
      />
      <TransitionGroup>
        <Collapse>{!collapse && children}</Collapse>
      </TransitionGroup>
    </Card>
  ) : (
    <Box
      sx={{
        padding: '13px 5px 5px',
        '@media only screen and (max-width: 1200px)': {
          padding: '13px 10px 10px',
        },
        '& > div': { padding: 0 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

const ColumnGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  gridGap: '10px',
  padding: '16px 10px 5px',
  alignItems: 'start',
  '& .MuiBox-root, & span': {
    display: 'flex',
    gap: '5px',
    alignItems: 'center',
  },
  '& span': {
    justifyContent: 'end',
  },
});

const MuiCard: FC<PopoverProps> = ({ children, sx, ...props }) => {
  const matches = useMediaQuery('(max-width: 1200px)');
  const isPageDash = useLocation().pathname === '/';
  const isPageStakingReferral = useLocation().pathname === '/referral';
  const isPageReferralLeaderboard = useLocation().pathname === '/referral-leaderboard';

  const isExplandedSideBar = isPageDash || isPageStakingReferral || isPageReferralLeaderboard;

  if (matches) {
    return (
      <Popover
        sx={{
          '& button:not(.MuiIconButton-root)': { display: 'block', marginBottom: '5px' },
          ...sx,
          '& > .MuiPaper-root': {
            width: 180,
            boxShadow: '0 0 10px 0 rgba(180,180,180,0.5)',
          },
        }}
        {...props}
      >
        {children}
      </Popover>
    );
  }
  return (
    <Card
      sx={{
        padding: isExplandedSideBar ? '16px 20px' : '5px',
        width: isExplandedSideBar ? '220px' : 'fit-content',
        textAlign: 'center',
        height: 'fit-content',

        '& button:not(.MuiIconButton-root)': { display: 'block', marginBottom: '5px' },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};

// eslint-disable-next-line import/prefer-default-export
export const SideWalletWidget: FC = () => {
  const theme = useTheme();
  const { account, chainId } = useActiveWeb3React();
  const dispatch = useAppDispatch();
  const matches = useMediaQuery('(max-width: 1200px)');
  const isPageDash = useLocation().pathname === '/';
  const isPageStakingReferral = useLocation().pathname === '/referral';
  const isPageReferralLeaderboard = useLocation().pathname === '/referral-leaderboard';
  const isExplandedSideBar = isPageDash || isPageStakingReferral || isPageReferralLeaderboard;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? ''];
  const userSwETHBalance = useTokenBalance(account ?? undefined, chainId ? SWETH[chainId] : undefined);
  const { loading: loadingTotalPosition, totalPositions, totalValue } = useGetYourPosition(account);
  const { APR, GetAPRError, loadingAPR } = useAppSelector((state) => state.stats);
  // const {} = use;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      {matches && (
        <Web3Status
          aria-describedby={id}
          char={4}
          onClick={() => dispatch(setIsWalletModalOpen(true))}
          onClickDropDown={handleClick}
          sx={{ margin: 'auto' }}
        />
      )}
      <MuiCard
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        id={id}
        onClose={handleClose}
        open={open}
        transformOrigin={{
          vertical: -20,
          horizontal: 'center',
        }}
      >
        {!matches && (
          <Web3Status char={4} onClick={() => dispatch(setIsWalletModalOpen(true))} sx={{ margin: 'auto' }} />
        )}
        <SideBarCard
          cardView={isExplandedSideBar}
          sx={{ marginTop: isExplandedSideBar ? '20px' : '' }}
          title="Your wallet"
        >
          <ColumnGrid>
            <Box>
              <EthereumIcon /> ETH
            </Box>
            <span>{userEthBalance?.toFixed(3) ?? '0.000'}</span>
            <Box>
              <SwellIcon /> swETH
            </Box>
            <span>{userSwETHBalance?.toFixed(2) ?? '0.00'}</span>
          </ColumnGrid>
        </SideBarCard>
        {(isPageDash || isPageReferralLeaderboard) && (
          <>
            <SideBarCard cardView={isPageDash || isPageReferralLeaderboard} title="Your total position">
              <ColumnGrid sx={{ paddingInline: 0, marginBottom: '20px' }}>
                <Box>Staked</Box>
                <span>
                  {loadingTotalPosition ? 0 : totalValue} <SwellIcon />
                </span>
                <Box>Positions</Box>
                <span>{loadingTotalPosition ? 0 : totalPositions}</span>
                {/* <Box>In vault</Box>
              <span>
                {balanceInVault} <SwellIcon />
              </span> */}
                <Box>Rewards</Box>
                <span>
                  0.00 <SwellIcon />
                </span>
                <Box sx={{ flexWrap: 'wrap', gap: '0 !important' }}>Average APR</Box>
                <span>
                  {GetAPRError ? (
                    <Button
                      onClick={getAPR}
                      size="small"
                      sx={{
                        fontSize: 10,
                        fontStyle: 'italic',
                        display: 'block',
                        textDecoration: 'underline',
                        padding: 0,
                        minWidth: 0,
                      }}
                      variant="text"
                    >
                      reload
                    </Button>
                  ) : (
                    <>{loadingAPR ? <CircularProgress size={15} /> : `${APR}%`}</>
                  )}
                </span>
              </ColumnGrid>
            </SideBarCard>
            <SideBarCard cardView={isPageDash || isPageReferralLeaderboard} title="Bulk actions">
              <Button
                disabled={true || totalPositions === 0}
                fullWidth
                onClick={() => dispatch(setIsDepositLiquidityTransactionModalOpen(true))}
                size="medium"
                sx={{ color: theme.palette.grey.A400, mt: 2 }}
              >
                Deposit
              </Button>
              <Button
                disabled={true || totalPositions === 0}
                fullWidth
                onClick={() => dispatch(setIsWithdrawLiquidityTransactionModalOpen(true))}
                size="medium"
                sx={{ color: theme.palette.grey.A400 }}
              >
                Withdraw
              </Button>
              <Button
                disabled={true || chainId === 1 || totalPositions === 0}
                fullWidth
                onClick={() => dispatch(setIsVaultTransactionModalOpen(true))}
                size="medium"
                sx={{ color: theme.palette.grey.A400, textTransform: 'none' }}
              >
                Enter vault
              </Button>
              <Button
                disabled={true || chainId === 1 || totalPositions === 0}
                fullWidth
                onClick={() => dispatch(setIsVaultTransactionModalOpen(true))}
                size="medium"
                sx={{ color: theme.palette.grey.A400, textTransform: 'none' }}
              >
                Exit vault
              </Button>
            </SideBarCard>
          </>
        )}
      </MuiCard>
    </>
  );
};
