/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useEffect, useState } from 'react';

import { Box, Card, CardContent, CardHeader, styled } from '@mui/material';
import { BigNumber, utils } from 'ethers';

import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsNodeOperatorInfoModalOpen } from '../../../state/modal/modalSlice';
import { INodeOperatorValidator } from '../../../state/nodeOperator/NodeOperator.interface';
import { Modal, SingleBarChart } from '../../../theme/uiComponents';
import getOperatorPerformanceFromRatedNetwork from '../../../utils/getOperatorPerformanceFromRatedNetwork';
import NodeOperatorIcon from '../../common/NodeOperatorIcon';

/*
// @TODO
create redux store for open modal 
store wallet data into redux store
*/
type ClientPercentage = {
  name: string;
  value: number;
};

type NodeOperatorPerformanceInfo = {
  performanceRating: number;
  ratingPercentile: number;
  clientDiversity: Array<ClientPercentage>;
  error: string | null;
};

type RowProps = {
  label: string;
  value: string;
};

const Row = styled(({ label, value, ...props }: RowProps) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <div {...props}>
    <Box>{label}</Box>
    <small>{value}</small>
  </div>
))({
  display: 'flex',
  justifyContent: 'space-between',
  '&:not(:last-child)': {
    marginBottom: 20,
  },
  '& small': {
    fontWeight: 400,
    fontSize: 13,
    marginLeft: 20,
  },
});

const InfoCardHeader = styled(CardHeader)(() => ({
  padding: 0,
  '& .MuiTypography-root': {
    paddingBottom: '10px',
    paddingLeft: '10px',
    margin: '0px',
    fontWeight: 500,
    fontSize: '16px',
  },
}));
const InfoCardContent = styled(CardContent)(({ theme }) => ({
  border: `2px solid ${theme.palette.grey[300]}`,
  borderRadius: '8px',
  marginBottom: '20px',
  padding: '16px',
  '& .MuiCardContent-root': {
    border: `2px solid ${theme.palette.grey[300]}`,
    borderRadius: '8px',
  },
}));

const NodeOperatorInfoModal: FC = () => {
  const { isNodeOperatorInfoModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const { nodeOperatorInfoToDisplay } = useAppSelector((state) => state.nodeOperator);
  const [TVL, setTVL] = useState('0');
  const [nodeOperatorPerformance, setNodeOperatorPerformance] = useState<NodeOperatorPerformanceInfo>();

  useEffect(() => {
    if (nodeOperatorInfoToDisplay !== undefined) {
      let tvl = BigNumber.from(0);
      const validators: INodeOperatorValidator[] =
        nodeOperatorInfoToDisplay?.validators === undefined ? [] : nodeOperatorInfoToDisplay?.validators;
      for (let i = 0; i < validators?.length; i += 1) {
        tvl = tvl.add(BigNumber.from(validators[i].depositBalance ? validators[i].depositBalance : 0));
      }
      setTVL(utils.formatEther(tvl));
    }
  }, [nodeOperatorInfoToDisplay]);

  useEffect(() => {
    (async () => {
      if (!nodeOperatorPerformance && nodeOperatorInfoToDisplay && nodeOperatorInfoToDisplay?.name) {
        const nodeOperatorPerformanceFromRatedNetwork = await getOperatorPerformanceFromRatedNetwork(
          nodeOperatorInfoToDisplay?.name
        );
        setNodeOperatorPerformance(nodeOperatorPerformanceFromRatedNetwork);
      }
    })();
  }, [nodeOperatorPerformance, setNodeOperatorPerformance, nodeOperatorInfoToDisplay]);

  const clientColors = [
    { name: 'Prysm', color: '#F947C5' },
    { name: 'Lighthouse', color: '#3259d6' },
    { name: 'Teku', color: '#96f8fa' },
    { name: 'Nimbus', color: '#f29f39' },
    { name: 'Other', color: '#9e9e9e' },
    { name: 'Unknown', color: '#9e9e9e' },
  ];

  return (
    // eslint-disable-next-line no-console
    <Modal
      icon={<NodeOperatorIcon logo={nodeOperatorInfoToDisplay?.logo} />}
      onClose={() => dispatch(setIsNodeOperatorInfoModalOpen(false))}
      open={isNodeOperatorInfoModalOpen}
      sx={{
        '& .MuiTypography-root': {
          paddingBottom: '30px',
        },
      }}
      title={nodeOperatorInfoToDisplay?.name ?? 'Node Operator'}
    >
      <Card>
        <InfoCardHeader title="Node operator details" />
        <InfoCardContent>
          <Row label="Name" value={nodeOperatorInfoToDisplay?.name || 'N/A'} />
          <Row label="Type" value={nodeOperatorInfoToDisplay?.category || 'N/A'} />
          <Row label="Website" value={nodeOperatorInfoToDisplay?.website || 'N/A'} />
          <Row label="Social link" value={nodeOperatorInfoToDisplay?.social || 'N/A'} />
          <Row label="Number of validators" value={`${nodeOperatorInfoToDisplay?.validators?.length}` || 'N/A'} />
          <Row label="Total staked" value={`${TVL}` || 'N/A'} />
          <Row label="No of stakers" value={`${0}` || 'N/A'} />
          <Row label="Commission rate" value={`${nodeOperatorInfoToDisplay?.rate}%` || 'N/A'} />
        </InfoCardContent>
      </Card>
      <Card>
        <InfoCardHeader title="Node operator performance" />
        <InfoCardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>Performance rating</Box>
            <Box>{nodeOperatorPerformance ? `${nodeOperatorPerformance?.performanceRating.toFixed(2)}%` : ''}</Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>Rating percentile</Box>
            <Box>{nodeOperatorPerformance ? `${nodeOperatorPerformance?.ratingPercentile.toFixed(2)}%` : ''}</Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>Client diversity</Box>
            {nodeOperatorPerformance ? (
              <div style={{ flexGrow: 1, maxWidth: '50%' }}>
                <SingleBarChart data={nodeOperatorPerformance.clientDiversity} isPercent keyColors={clientColors} />
              </div>
            ) : (
              <></>
            )}
          </Box>
          <Row label="Time active on Mainnet" value="0" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>MEV-Boost</Box>
          </Box>
          <Row label="APR (forward looking)" value="0" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>Operator info page</Box>
          </Box>
        </InfoCardContent>
      </Card>
    </Modal>
  );
};

export default NodeOperatorInfoModal;
