import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLazyQuery } from '@apollo/client';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';

import { GET_ALL_NODE_OPERATORS } from '../../shared/graphql';
import { useAppDispatch } from '../../state/hooks';
import { setIsNodeOperatorModalOpen } from '../../state/modal/modalSlice';
import { INodeOperator } from '../../state/nodeOperator/NodeOperator.interface';
import NodeCard from './NodeCard';
import NodeOperatorRow from './NodeOperatorRow';

const NodeOperatorCard: FC<BoxProps> = ({ ...props }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [fetchAllNodeOperators, { loading, error, data: nodeOperators }] = useLazyQuery(GET_ALL_NODE_OPERATORS);
  const [resultLength, setResultLength] = useState(4);
  const { enqueueSnackbar } = useSnackbar();

  const filteredNodeOperators = useMemo(() => {
    let filteredNodeOperatorsOrigin: INodeOperator[] = [];
    if (nodeOperators && nodeOperators.allNodeOperators && nodeOperators.allNodeOperators.length > 0) {
      filteredNodeOperatorsOrigin = nodeOperators.allNodeOperators;
    }
    return filteredNodeOperatorsOrigin;
  }, [nodeOperators]);

  const handleLoadMore = () => {
    if (resultLength) {
      setResultLength(resultLength + 4);
    }
  };

  const handleBecomeNodeOperatorButtonClick = () => {
    dispatch(setIsNodeOperatorModalOpen(false));
    navigate('/become-a-node-operator');
  };

  useEffect(() => {
    if (!loading && !error) {
      fetchAllNodeOperators();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllNodeOperators]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  }, [enqueueSnackbar, error]);

  return (
    <Box {...props}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          justifyContent: 'center',
          color: '#000',
          fontSize: '40px',
          marginBottom: '20px',
          [theme.breakpoints.down('sm')]: {
            gridTemplateColumns: '1fr',
          },
        }}
      >
        <NodeCard onClick={handleBecomeNodeOperatorButtonClick}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              '& > span': {
                fontSize: '18px',
                fontWeight: '600',
              },
            }}
          >
            <span>Register or update your node operator</span>
          </Box>
          <span role="button">
            <ArrowForwardIcon className="forward-icon" />
          </span>
        </NodeCard>
      </Box>
      <Typography
        component="p"
        sx={{
          textAlign: 'center',
          marginBottom: '17px',
          fontSize: '13px',
        }}
      >
        Select a node operator to stake with
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '10px',
          '& .MuiPaper-root': {
            borderRadius: '15px !important',
          },
        }}
      >
        {!loading &&
          !error &&
          filteredNodeOperators
            .slice(0, resultLength)
            .map((nodeOperator: INodeOperator) => (
              <NodeOperatorRow key={`node_${nodeOperator.id}_${nodeOperator.name}`} nodeOperator={nodeOperator} />
            ))}
      </Box>

      {filteredNodeOperators.length > 4 && resultLength < filteredNodeOperators.length && (
        <LoadingButton onClick={handleLoadMore} size="small" sx={{ width: '100%', fontSize: '13px' }}>
          Load More
        </LoadingButton>
      )}
    </Box>
  );
};

export default NodeOperatorCard;
