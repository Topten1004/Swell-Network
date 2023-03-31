/* eslint-disable react/jsx-max-props-per-line */
import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useLazyQuery, useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, styled, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import ImageUploadController from '../components/common/ImageUploadController';
import InputController from '../components/common/InputController';
import { CREATE_NODE_OPERATOR, GET_NODE_OPERATOR_BY_USER, GET_NONCE_BY_USER, UPLOAD_FILE } from '../shared/graphql';
import { useAppDispatch } from '../state/hooks';
import { setIsDesktopOnlyModalOpen, setIsWalletModalOpen } from '../state/modal/modalSlice';
import { INodeOperator } from '../state/nodeOperator/NodeOperator.interface';
import { displayErrorMessage } from '../utils/errors';
import { isMobile } from '../utils/userAgent';
import { BecomeANodeOperatorSchema } from '../validations/become-a-node-operator.schema';

const FormContainer = styled('form')(() => ({
  maxWidth: 440,
  width: '100%',
  margin: 'auto',
}));

const FormGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr) )',
  gridGap: '0 10px',
  alignItems: 'start',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(275px, 1fr) )',
  },
  [theme.breakpoints.down('sm')]: {
    gridGap: 'unset',
  },
}));
const FormHeading = styled('p')({
  marginBottom: '20px',
});

const options = [
  { label: 'Individual', value: 'INDIVIDUAL' },
  { label: 'Institutional', value: 'INSTITUTIONAL' },
];

const ExecutionListOptions = [
  { label: 'Geth', value: 'GETH' },
  { label: 'Besu', value: 'BESU' },
  { label: 'Nethermind', value: 'NETHERMIND' },
  { label: 'Erigon', value: 'ERIGON' },
];

const ConsensusListOptions = [
  { label: 'Lighthouse', value: 'LIGHTHOUSE' },
  { label: 'Nimbus', value: 'NIMBUS' },
  { label: 'Teku', value: 'TEKU' },
  { label: 'Prysm', value: 'PRYSM' },
  { label: 'Lodestar', value: 'LODESTAR' },
];

const BecomeANodeOperatorApplicationForm: FC = () => {
  const { account, library } = useWeb3React();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState<any>();
  // Deprecated
  // const swNFTContract = useSwNftContract();
  // const [operatorRate, setOperatorRate] = useState<number>(0);

  const [fetchUserData, { loading, error: userDataFetchingError, data: fetchedUserData }] =
    useLazyQuery(GET_NODE_OPERATOR_BY_USER);
  const [createUser, newUser] = useMutation(CREATE_NODE_OPERATOR);
  const [getNonceByUser] = useMutation(GET_NONCE_BY_USER);
  const [uploadFile] = useMutation(UPLOAD_FILE);

  const method = useForm<INodeOperator>({
    mode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: true,
    resolver: yupResolver(BecomeANodeOperatorSchema),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleSubmit, setValue, watch, reset } = method;

  // Deprecated
  // const fetchOperatorRate = useCallback(async () => {
  //   if (swNFTContract) {
  //     try {
  //       const currentRate: BigNumber = await swNFTContract.opRate(account);
  //       setOperatorRate(parseInt(currentRate.toString(), 10));
  //     } catch (error) {
  //       enqueueSnackbar('Unable to fetch current operator rate', { variant: 'success' });
  //     }
  //   }
  // }, [account, enqueueSnackbar, swNFTContract]);

  // fetch form data
  useEffect(() => {
    if (account) {
      fetchUserData({
        variables: {
          wallet: account,
        },
      });
    }
  }, [account, fetchUserData]);

  useEffect(() => {
    if (!loading && fetchedUserData) {
      setFormData(fetchedUserData?.nodeOperatorByUser);
    }
  }, [enqueueSnackbar, fetchedUserData, loading, userDataFetchingError]);

  const handleChangeLogo = (e: any) => {
    const file = e.target.files[0];

    if (file) {
      try {
        uploadFile({
          variables: {
            file,
          },
          onCompleted(data) {
            setValue('logo', data.uploadFile);
          },
          onError(error) {
            enqueueSnackbar(error.message, { variant: 'error' });
          },
        });
      } catch (error) {
        displayErrorMessage(enqueueSnackbar, error);
      }
    }
  };

  // reset
  useEffect(() => {
    if (formData) {
      reset({
        location: formData.location,
        nodes: formData.nodes,
        cpu: formData.cpu,
        ram: formData.ram,
        network: formData.network,
        storage: formData.storage,
        executionLayerClients: formData.executionLayerClients,
        consensusLayerClients: formData.consensusLayerClients,
        category: formData.category,
        name: formData.name,
        yearsOfExperience: formData.yearsOfExperience,
        email: formData.email,
        website: formData.website,
        social: formData.social,
        description: formData.description,
        rate: formData.rate.toString(),
        logo: formData.logo,
      });
    } else {
      reset({
        location: undefined,
        nodes: undefined,
        cpu: undefined,
        ram: undefined,
        network: undefined,
        storage: undefined,
        executionLayerClients: undefined,
        consensusLayerClients: undefined,
        category: undefined,
        name: undefined,
        yearsOfExperience: undefined,
        email: undefined,
        website: undefined,
        social: undefined,
        description: undefined,
        rate: undefined,
        logo: undefined,
      });
    }
  }, [formData, reset]);

  const onSubmit = (data: INodeOperator) => {
    try {
      if (account && !isSubmitting) {
        setIsSubmitting(true);
        getNonceByUser({
          variables: {
            userUniqueInput: {
              wallet: account,
            },
          },
          async onCompleted({ nonceByUser }) {
            try {
              const { nonce, timestamp } = nonceByUser;
              const signer = library.getSigner();
              const signature = await signer.signMessage(`I am signing my one-time nonce: ${nonce}`);
              createUser({
                variables: {
                  userNodeOperatorCreateInput: {
                    wallet: account,
                    nodeOperator: {
                      location: data.location,
                      nodes: data.nodes,
                      cpu: data.cpu,
                      ram: data.ram,
                      executionLayerClients: data.executionLayerClients,
                      consensusLayerClients: data.consensusLayerClients,
                      network: data.network,
                      storage: data.storage,
                      category: data.category,
                      name: data.name,
                      yearsOfExperience: data.yearsOfExperience,
                      email: data.email ?? null,
                      website: data.website ?? null,
                      social: data.social ?? null,
                      description: data.description,
                      rate: data.rate,
                      logo: data.logo,
                    },
                  },
                  userSignatureInput: {
                    wallet: account,
                    signature,
                    timestamp,
                  },
                },
                onCompleted({ createNodeOperator }) {
                  setIsSubmitting(false);
                  if (createNodeOperator) {
                    const nodeOperatorId = createNodeOperator.nodeOperator?.id;
                    if (nodeOperatorId) {
                      navigate(`/register-with-ethdo/${nodeOperatorId}`);
                    }
                  }
                },
                onError(error) {
                  setIsSubmitting(false);
                  enqueueSnackbar(error.message, { variant: 'error' });
                },
              });
            } catch (error) {
              setIsSubmitting(false);
              displayErrorMessage(enqueueSnackbar, error);
            }
          },
          onError(error) {
            setIsSubmitting(false);
            enqueueSnackbar(error.message, { variant: 'error' });
          },
        });
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    }
  };

  useEffect(() => {
    if (isMobile) {
      dispatch(setIsDesktopOnlyModalOpen(true));
    }
  }, [dispatch]);

  return (
    <>
      <Typography component="h2" sx={{ mb: '40px', textAlign: 'center' }} variant="h2">
        Become a Node Operator
      </Typography>
      <FormProvider {...method}>
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <Box component="h3" sx={{ fontSize: '22px', marginBottom: '32px', textAlign: ['center', 'left'] }}>
            Application form
          </Box>
          <FormHeading>Tell us about your server</FormHeading>
          <InputController label="Location*" name="location" placeholder="" />
          <InputController label="Number of nodes*" name="nodes" numberFormat placeholder="" />
          <FormGrid>
            <InputController label="CPU Cores(no.)*" name="cpu" numberFormat placeholder="" />
            <InputController label="RAM (MB)*" name="ram" numberFormat placeholder="" />
          </FormGrid>
          <FormGrid sx={{ marginBottom: '20px' }}>
            <InputController label="Bandwidth (MB)*" name="network" numberFormat placeholder="" />
            <InputController label="Storage (TB)*" name="storage" numberFormat placeholder="" />
          </FormGrid>
          <FormGrid sx={{ marginBottom: '20px' }}>
            <InputController
              label="Execution layer clients"
              name="executionLayerClients"
              options={ExecutionListOptions}
              placeholder="Please select"
              select
            />
            <InputController
              label="Consensus layer clients"
              name="consensusLayerClients"
              options={ConsensusListOptions}
              placeholder="Please select"
              select
            />
          </FormGrid>
          <FormHeading>Your details</FormHeading>
          <InputController
            label="Individual or institutional*"
            name="category"
            options={options}
            placeholder="Please select"
            select
          />
          <InputController label="Name*" name="name" placeholder="" />
          {account ? (
            <ImageUploadController
              buttonName="Upload profile picture"
              id="node-operator-logo"
              onChange={handleChangeLogo}
              value={watch('logo')}
            />
          ) : (
            <Button
              onClick={() => dispatch(setIsWalletModalOpen(true))}
              size="large"
              sx={{ color: theme.palette.grey.A400, marginLeft: '16px', marginBottom: '26px' }}
            >
              Connect wallet
            </Button>
          )}
          <InputController label="Years of experience*" name="yearsOfExperience" numberFormat placeholder="" />
          <InputController label="Email" name="email" placeholder="" type="email" />
          <InputController label="Website" name="website" placeholder="" />
          <InputController label="Social media url" name="social" placeholder="" />
          <InputController
            InputProps={{ multiline: true, rows: 2 }}
            label="Description*"
            name="description"
            placeholder=""
          />
          <InputController
            disabled={formData?.rate !== undefined}
            label="Commission Rate (%)*"
            name="rate"
            numberFormat
            placeholder="0 - 10"
          />
          {account ? (
            <LoadingButton
              disabled={isSubmitting || newUser.loading || loading}
              fullWidth
              loading={isSubmitting || newUser.loading || loading}
              sx={{ color: theme.palette.grey.A400 }}
              type="submit"
              variant="contained"
            >
              Next Step
            </LoadingButton>
          ) : (
            <Button
              fullWidth
              onClick={() => dispatch(setIsWalletModalOpen(true))}
              size="large"
              sx={{ color: theme.palette.grey.A400 }}
            >
              Connect wallet
            </Button>
          )}
        </FormContainer>
      </FormProvider>
    </>
  );
};

export default BecomeANodeOperatorApplicationForm;
