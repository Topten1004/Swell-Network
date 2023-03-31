import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useLazyQuery } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useWeb3React } from 'web3-react-core';

import RegisterEthDoForm from '../components/registerEthDo/RegisterEthDoForm';
import RegisterStepOne from '../components/registerEthDo/RegisterStepOne';
import { GET_VALIDATORS_OF_NODE_OPERATOR_BY_USER } from '../shared/graphql';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { setIsDesktopOnlyModalOpen } from '../state/modal/modalSlice';
import { isMobile } from '../utils/userAgent';

const RegisterWithEthDo: FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { account } = useWeb3React();

  const [disabled, setDisabled] = useState(true);
  const { isSubmissionComplete, selectedPublicKey } = useAppSelector((state) => state.registerEthDo);
  const { nodeOperatorId } = useParams();
  const dispatch = useAppDispatch();

  const [fetchValidatorsOfNodeOperatorByUser, { data: fetchedValidatorsOfNodeOperatorByUser }] = useLazyQuery(
    GET_VALIDATORS_OF_NODE_OPERATOR_BY_USER,
    { fetchPolicy: 'network-only' }
  );

  if (!nodeOperatorId) {
    navigate('/become-a-node-operator');
  }

  useEffect(() => {
    if (account) {
      fetchValidatorsOfNodeOperatorByUser({
        variables: {
          wallet: account,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  useEffect(() => {
    if (account) {
      if (
        fetchedValidatorsOfNodeOperatorByUser &&
        (!fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser ||
          fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser.id !== Number(nodeOperatorId))
      ) {
        navigate('/become-a-node-operator');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedValidatorsOfNodeOperatorByUser]);

  useEffect(() => {
    if (isSubmissionComplete && selectedPublicKey) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [isSubmissionComplete, selectedPublicKey]);

  useEffect(() => {
    if (isMobile) {
      dispatch(setIsDesktopOnlyModalOpen(true));
    }
  }, [dispatch]);

  return (
    <Box sx={{ maxWidth: '600px', width: '100%', margin: 'auto' }}>
      <Box
        sx={{
          mb: '20px',
        }}
      >
        <Typography
          component="span"
          onClick={() => navigate('/become-a-node-operator')}
          role="button"
          sx={{
            ml: '10px',
            display: 'block',
            [theme.breakpoints.down('sm')]: {
              textAlign: 'center',
            },
          }}
        >
          <ArrowBackIcon />
          Back to become a node operator
        </Typography>
        <Typography
          component="h2"
          sx={{
            ml: '10px',
            mb: '40px',
            textAlign: 'left',
            [theme.breakpoints.down('sm')]: {
              textAlign: 'center',
              width: '100%',
              fontSize: '28px',
            },
          }}
          variant="h2"
        >
          Deposit data
        </Typography>
        <RegisterStepOne />
        <RegisterEthDoForm />
      </Box>
      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <Button
          disabled={disabled}
          fullWidth
          onClick={() => navigate(`/deposit-ethereum/${nodeOperatorId}`)}
          sx={{ color: theme.palette.grey.A400, width: '440px' }}
          variant="contained"
        >
          Next Step
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterWithEthDo;
