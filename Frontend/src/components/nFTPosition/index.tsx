import { FC, useState } from 'react';

import { Box, CircularProgress } from '@mui/material';
import { BigNumber, ethers } from 'ethers';
import { useSnackbar } from 'notistack';

import { UsePositionTokenURIResult } from '../../hooks/usePositionTokenURI';
import { List, ListColumn, SwellIcon } from '../../theme/uiComponents';
import { PositionDetails } from '../../types/position';
import NFT from '../common/PositionAnimation';

interface NFTPositionProps {
  loading: boolean;
  metadata: UsePositionTokenURIResult;
  positionDetails: PositionDetails | undefined;
  totalSwEthInVault: BigNumber;
}

const NFTPosition: FC<NFTPositionProps> = ({ loading, metadata, positionDetails, totalSwEthInVault }) => {
  let url = '';
  if (metadata && 'result' in metadata) {
    url = metadata.result.image;
  }
  const formattedBaseTokenBalance = positionDetails
    ? ethers.utils.formatEther(positionDetails.baseTokenBalance).split('.')[0]
    : '0.00';
  const stakedAmount = positionDetails ? ethers.utils.formatEther(positionDetails.value).split('.')[0] : '0.00';
  const timeStamp = positionDetails ? positionDetails.timeStamp.toString() : '';
  const stakedDate = new Date(Number(timeStamp) * 1000);
  const stakedTime = stakedDate.toLocaleString();
  const validatorPubKey = positionDetails ? positionDetails.pubKey : '';
  const [showFullPubKey, setShowFullPubKey] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onValidatorPubKeyClicked = () => {
    setShowFullPubKey(!showFullPubKey);
    navigator.clipboard.writeText(validatorPubKey);
    enqueueSnackbar('Validator PubKey Copied', { variant: 'success' });
  };

  return (
    <List
      sx={{
        padding: '12px 5px 16px 5px',
        background: (theme) => theme.palette.background.primaryGradient,
        color: (theme) => theme.palette.grey.A400,
        marginBottom: 'unset',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        {url ? <NFT height={400} image={url} /> : <Box height={400}>{loading && <CircularProgress />}</Box>}
      </Box>
      <ListColumn>
        Validator
        <Box
          onClick={() => onValidatorPubKeyClicked()}
          sx={{
            wordBreak: 'break-word',
            '&:hover': {
              color: '#00B0F0',
            },
          }}
        >
          {showFullPubKey ? validatorPubKey : `${validatorPubKey.slice(0, 16)}...`}
        </Box>
      </ListColumn>
      <ListColumn>
        Staked Amount
        <span>
          <SwellIcon color="default" size="xs" />
          {stakedAmount}
        </span>
      </ListColumn>
      <ListColumn>
        Staked Time
        <span>{stakedTime}</span>
      </ListColumn>
      <br />
      <ListColumn>
        Total swETH available
        <span>
          <SwellIcon color="default" size="xs" />
          {formattedBaseTokenBalance}
        </span>
      </ListColumn>
      <ListColumn>
        Total swETH in vault
        <span>
          <SwellIcon color="default" size="xs" />
          {Number(ethers.utils.formatEther(totalSwEthInVault.toString()))}
        </span>
      </ListColumn>
    </List>
  );
};

export default NFTPosition;
