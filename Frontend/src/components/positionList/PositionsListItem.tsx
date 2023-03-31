import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLazyQuery } from '@apollo/client';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Button, CircularProgress, styled } from '@mui/material';
import { BigNumber, ethers } from 'ethers';

import { useAllVaultsWithPositions } from '../../hooks/useVault';
import { GET_NODE_OPERATOR_BY_VALIDATOR } from '../../shared/graphql';
import { useAppSelector } from '../../state/hooks';
import { List, ListColumn, ListHeader, MuiTooltip, SwellIcon } from '../../theme/uiComponents';
import { PositionDetails } from '../../types/position';
import getAPR from '../../utils/getAPR';
import NodeOperatorIcon from '../common/NodeOperatorIcon';

const DataContainer = styled(ListColumn)(() => ({
  padding: 0,
  '& .MuiChip-root': {
    fontSize: 10,
    '& span': {
      fontWeight: 600,
    },
  },
  '& > span': {
    fontSize: 16,
    fontWeight: 600,
    marginLeft: 1,
  },
}));

const PositionContent = styled('div')(({ theme }) => ({
  display: 'grid',
  justifyContent: 'space-evenly',
  marginBottom: 20,
  padding: '10px 0',
  gridGap: '0px 15px',
  paddingRight: '20px',
  gridTemplateColumns: 'repeat(4, 1fr)',
  [theme.breakpoints.between('sm', 'md')]: {
    gridGap: '0px 10px',
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    paddingRight: '0px',
  },
}));

const BondContent = styled('div')(({ theme }) => ({
  borderRadius: '10px',
  background: theme.palette.primary.light,
  color: theme.palette.primary.main,
  padding: '0 8px',

  '> button': {
    color: theme.palette.primary.main,
  },
}));

interface PositionListItemProps {
  position: PositionDetails;
}

const PositionsListItem: FC<PositionListItemProps> = ({ position }) => {
  const navigate = useNavigate();
  const formattedTokenId = position.tokenId.toString().split('.')[0];
  const formattedBaseTokenBalance = ethers.utils.formatEther(position.baseTokenBalance).split('.')[0];
  const viewDetailedPosition = () => {
    navigate(`/position/${formattedTokenId}`);
    window.scrollTo({ top: 0 });
  };
  const [balances] = useAllVaultsWithPositions(position.tokenId);
  const totalSwEthInVault = Object.values(balances).reduce(
    (previousValue, currentValue) => previousValue.add(currentValue),
    BigNumber.from(0)
  );
  const [fetchPositionData, { data: fetchedPositionData }] = useLazyQuery(GET_NODE_OPERATOR_BY_VALIDATOR);
  const { APR, GetAPRError, loadingAPR } = useAppSelector((state) => state.stats);

  useEffect(() => {
    if (position) {
      fetchPositionData({
        variables: {
          pubKey: position.pubKey,
        },
      });
    }
  }, [position, fetchPositionData]);

  return (
    <List onClick={viewDetailedPosition} sx={{ cursor: 'pointer' }}>
      <ListHeader>
        <DataContainer>
          <NodeOperatorIcon
            logo={fetchedPositionData?.nodeOperatorByValidator?.logo}
            style={{ width: 24, height: 24, minWidth: 24 }}
          />
          <span>
            {formattedTokenId}
            {fetchedPositionData && fetchedPositionData.nodeOperatorByValidator?.name
              ? ` - ${fetchedPositionData.nodeOperatorByValidator?.name}`
              : ''}
          </span>
        </DataContainer>
        <DataContainer>
          {position.operator && (
            <>
              <BondContent>BOND</BondContent>
              <MuiTooltip title="ETH collateral held for node operators" />
            </>
          )}
          <span role="button">
            <ArrowForwardIcon />
          </span>
        </DataContainer>
      </ListHeader>
      <PositionContent>
        <ListColumn>
          swETH available
          <span>
            <SwellIcon size="xs" />
            {formattedBaseTokenBalance}
          </span>
        </ListColumn>
        <ListColumn>
          swETH in vault
          <span>
            <SwellIcon size="xs" />
            {Number(ethers.utils.formatEther(totalSwEthInVault.toString()))}
          </span>
        </ListColumn>
        <ListColumn>
          Average APR
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
        </ListColumn>
        <ListColumn>
          Rewards
          <span>
            <SwellIcon size="xs" />0
          </span>
        </ListColumn>
      </PositionContent>
    </List>
  );
};

export default PositionsListItem;
