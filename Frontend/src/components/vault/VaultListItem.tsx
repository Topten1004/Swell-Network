import { FC } from 'react';
import { useNavigate } from 'react-router-dom';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import { useGetYourPosition } from '../../hooks/useV3Positions';
import { useVaultDetail } from '../../hooks/useVault';
import { List, ListColumn, ListHeader, SwellIcon } from '../../theme/uiComponents';
import { shortenAddress } from '../../utils';
import { ButtonGroupWrapper, Column, VaultContent, VaultName } from './Styled';
import VaultIcon from './VaultIcon';

interface VaultListItemProps {
  index: number;
}

const VaultListItem: FC<VaultListItemProps> = ({ index }) => {
  const theme = useTheme();
  const matches = useMediaQuery(`(max-width: ${theme.breakpoints.values.sm}px)`);
  const navigate = useNavigate();
  const { account } = useWeb3React();
  const { loading, vaultDetail } = useVaultDetail(index, account);
  const { loading: balanceLoading, totalBaseTokenBalance } = useGetYourPosition(account);

  return (
    <List>
      {(loading || balanceLoading) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.5,
            background: theme.palette.primary.light,
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress size="20px" />
        </Box>
      )}
      <ListHeader onClick={() => navigate(`/vault-detail/${index + 1}`)} sx={{ cursor: 'pointer' }}>
        <VaultName>
          <VaultIcon logo={vaultDetail?.info?.logo} />
          <span>{vaultDetail && vaultDetail.address && shortenAddress(vaultDetail.address)}</span>
        </VaultName>
        <Box sx={{ display: 'flex' }}>
          {!matches && (
            <>
              <Column>
                Total assets
                <span>
                  <SwellIcon size="xs" />
                  {vaultDetail?.balance}
                </span>
              </Column>
              <Column sx={{ marginRight: '10px' }}>
                APY value
                <span>
                  <SwellIcon size="xs" />
                  {vaultDetail?.averageAPY}
                </span>
              </Column>
            </>
          )}
          <span role="button">
            <ArrowForwardIcon sx={{ width: 27, height: 27 }} />
          </span>
        </Box>
      </ListHeader>
      <VaultContent>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2,1fr)',
            [theme.breakpoints.down('sm')]: {
              gridTemplateColumns: '1fr',
              width: '100%',
              marginBottom: '10px',
            },
          }}
        >
          {matches ? (
            <>
              <ListColumn
                sx={{
                  justifyContent: 'flex-start',
                  [theme.breakpoints.down('sm')]: {
                    justifyContent: 'space-between',
                  },
                }}
              >
                Average APR
                <span>
                  <SwellIcon size="xs" />
                  {vaultDetail?.averageAPR}
                </span>
              </ListColumn>
              <ListColumn
                sx={{
                  justifyContent: 'flex-start',
                  [theme.breakpoints.down('sm')]: {
                    justifyContent: 'space-between',
                  },
                }}
              >
                Total assets
                <span>
                  <SwellIcon size="xs" />
                  {vaultDetail?.balance}
                </span>
              </ListColumn>
              <ListColumn
                sx={{
                  justifyContent: 'flex-start',
                  [theme.breakpoints.down('sm')]: {
                    justifyContent: 'space-between',
                  },
                }}
              >
                Vault type
                <span>
                  <SwellIcon size="xs" />
                  {/* {contract?.averageAPR} */} 5
                </span>
              </ListColumn>
            </>
          ) : (
            <>
              <ListColumn sx={{ justifyContent: 'flex-start' }}>
                Your total investment
                <SwellIcon size="xs" />
                {vaultDetail?.balance}
              </ListColumn>
              <ListColumn sx={{ justifyContent: 'flex-start' }}>
                Available To Enter
                <SwellIcon size="xs" /> {totalBaseTokenBalance}
              </ListColumn>
            </>
          )}
        </Box>
        <ButtonGroupWrapper>
          <Button onClick={() => navigate(`/vault-detail/${index + 1}`)} size="medium">
            ENTER
          </Button>
          <Button onClick={() => navigate(`/vault-detail/${index + 1}`)} size="medium">
            EXIT
          </Button>
        </ButtonGroupWrapper>
      </VaultContent>
    </List>
  );
};

export default VaultListItem;
