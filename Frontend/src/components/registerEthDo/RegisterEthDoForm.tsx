/* eslint-disable no-console */
import { FC, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { useLazyQuery, useMutation } from '@apollo/client';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import { Button, Card, Typography, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { useSwNftContract } from '../../hooks/useContract';
import {
  CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON,
  GET_DEPOSIT_DATAS_BY_VALIDATOR,
  GET_NONCE_BY_USER,
  GET_VALIDATORS_OF_NODE_OPERATOR_BY_USER,
} from '../../shared/graphql';
import { setCurrentStep, setDepositDataLength } from '../../state/formStepper/formStepperSlice';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setIsWalletModalOpen } from '../../state/modal/modalSlice';
import { displayErrorMessage } from '../../utils/errors';
import { RegisterWithEthdoSchema } from '../../validations/register-with-ethdo.schema';
import AutocompleteController from '../common/AutocompleteController';
import FormStepper from '../stepper/FormStepper';
import { SubmitDepositDataForm } from './SubmitDepositDataForm';

interface IRegisterWithEthdoFields {
  publicKey: string;
  totalEth: string;
  depositData: string;
}

const RegisterEthDoForm: FC = () => {
  const { account, library } = useWeb3React();
  const theme = useTheme();
  const method = useForm<IRegisterWithEthdoFields>({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      publicKey: '',
    },
    resolver: yupResolver(RegisterWithEthdoSchema),
  });
  const [submitInProgress, setSubmitInProgress] = useState(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = method;
  const dispatch = useAppDispatch();
  const { currentStep, depositDataLength } = useAppSelector((state) => state.formStepper);
  const [depositDatas, setDepositDatas] = useState<any[]>([]);
  const [validatorPublicKeys, setValidatorPublicKeys] = useState<string[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const swNFTContract = useSwNftContract();
  const [whitelisted, setWhitelisted] = useState(false);
  const [superWhitelisted, setSuperWhitelisted] = useState(false);

  const { selectedPublicKey } = useAppSelector((state) => state.registerEthDo);
  const [
    fetchValidatorsOfNodeOperatorByUser,
    { loading, error: errorFetchingValidatorsOfNodeOperatorByUser, data: fetchedValidatorsOfNodeOperatorByUser },
  ] = useLazyQuery(GET_VALIDATORS_OF_NODE_OPERATOR_BY_USER, { fetchPolicy: 'network-only' });

  const [
    fetchDepositDatasByValidator,
    { loading: loadingDepositData, error: fetchingDepositDataError, data: fetchedDepositDatas },
  ] = useLazyQuery(GET_DEPOSIT_DATAS_BY_VALIDATOR);

  const [createDepositDataByValidatorFromJson] = useMutation(CREATE_DEPOSIT_DATA_BY_VALIDATOR_FROM_JSON);

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
    if (fetchedDepositDatas) {
      setDepositDatas(fetchedDepositDatas.depositDatasByValidator);
    }
  }, [fetchedDepositDatas]);

  useEffect(() => {
    if (selectedPublicKey.length === 98 && !loadingDepositData && !fetchingDepositDataError) {
      fetchDepositDatasByValidator({
        variables: {
          pubKey: selectedPublicKey,
          amount: '',
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPublicKey, fetchDepositDatasByValidator]);

  useEffect(() => {
    const updateWhitelistStatus = async () => {
      let leng = 16;
      if (selectedPublicKey && selectedPublicKey.length === 98 && swNFTContract) {
        try {
          const superWhiteListed = await swNFTContract.superWhiteList(selectedPublicKey);
          const whiteListed = await swNFTContract.whiteList(selectedPublicKey);

          setWhitelisted(whiteListed);
          setSuperWhitelisted(superWhiteListed);

          if (superWhiteListed) {
            leng = 32;
          } else if (whiteListed) {
            leng = 31;
          }
        } catch (error) {
          displayErrorMessage(enqueueSnackbar, error);
        }
      }

      dispatch(setDepositDataLength(leng));
    };

    updateWhitelistStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPublicKey, swNFTContract]);

  useEffect(() => {
    if (errorFetchingValidatorsOfNodeOperatorByUser) {
      setValidatorPublicKeys([]);
      setValue('publicKey', '');
      enqueueSnackbar(errorFetchingValidatorsOfNodeOperatorByUser.message, { variant: 'error' });
    } else if (
      account &&
      !loading &&
      fetchedValidatorsOfNodeOperatorByUser &&
      fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser &&
      fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser.validators
    ) {
      if (
        fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser.validators &&
        fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser.validators.length > 0
      ) {
        const options = fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser.validators.map(
          (validator: { pubKey: string }) => validator.pubKey
        );
        setValidatorPublicKeys(options);
      } else {
        setValidatorPublicKeys([]);
        setValue('publicKey', '');
      }
    } else {
      setValidatorPublicKeys([]);
      setValue('publicKey', '');
    }
  }, [
    account,
    enqueueSnackbar,
    errorFetchingValidatorsOfNodeOperatorByUser,
    fetchValidatorsOfNodeOperatorByUser,
    fetchedValidatorsOfNodeOperatorByUser,
    loading,
    setValue,
  ]);

  const [getNonceByUser] = useMutation(GET_NONCE_BY_USER);

  const submitSubForms = (data: IRegisterWithEthdoFields) => {
    try {
      setSubmitInProgress(true);
      if (account) {
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

              createDepositDataByValidatorFromJson({
                variables: {
                  nodeOperatorUniqueInput: {
                    id: fetchedValidatorsOfNodeOperatorByUser.nodeOperatorByUser.id,
                  },
                  depositDataCreateWithJsonInput: {
                    amount: data.totalEth,
                    data: data.depositData,
                    pubKey: data.publicKey,
                  },
                  userSignatureInput: {
                    wallet: account,
                    signature,
                    timestamp,
                  },
                },
                async onCompleted(res) {
                  if (!validatorPublicKeys.includes(data.publicKey)) {
                    setValidatorPublicKeys([...validatorPublicKeys, data.publicKey]);
                  }
                  if (currentStep < depositDataLength - 1) {
                    dispatch(setCurrentStep(currentStep + 1));
                  }
                  setDepositDatas(res.createDepositDataByValidatorFromJson.depositDatas);
                  enqueueSnackbar('Upload successful', { variant: 'success' });
                },
                onError(error) {
                  enqueueSnackbar(error.message, { variant: 'error' });
                },
              });
            } catch (error) {
              displayErrorMessage(enqueueSnackbar, error);
            }
          },
          onError(error) {
            enqueueSnackbar(error.message, { variant: 'error' });
          },
        });
      }
    } catch (error) {
      displayErrorMessage(enqueueSnackbar, error);
    } finally {
      setSubmitInProgress(false);
    }
  };

  return (
    <Card
      sx={{
        border: `2px solid ${theme.palette.common.white}`,
        borderRadius: '8px',
        padding: '34px 30px',
        [theme.breakpoints.down('sm')]: {
          padding: 0,
          border: 0,
        },
      }}
    >
      <Typography component="p" sx={{ mb: '10px' }}>
        Step 2
      </Typography>
      <Typography
        component="h4"
        sx={{
          mb: '20px',
          fontSize: '22px',
          fontWeight: '600',
        }}
        variant="h4"
      >
        Upload deposit data
      </Typography>
      <FormProvider {...method}>
        <form noValidate onSubmit={handleSubmit(submitSubForms)}>
          <AutocompleteController
            freeSolo
            label="Choose or enter your public key*"
            loading={loading}
            name="publicKey"
            options={validatorPublicKeys}
            placeholder="Choose or enter your public key"
          />
          <Card
            sx={{
              padding: '22px 21px 26px 21px',
              marginBottom: '20px',
              background: theme.palette.common.white,
            }}
          >
            <Typography
              component="p"
              sx={{
                fontSize: '18px',
                textAlign: 'center',
                mb: '14px',
              }}
            >
              Submit your deposit data
            </Typography>
            <SubmitDepositDataForm depositDatas={depositDatas} />
            {account ? (
              <LoadingButton
                disabled={isSubmitting || submitInProgress}
                fullWidth
                loading={isSubmitting || submitInProgress}
                sx={{
                  color: theme.palette.grey.A400,
                }}
                type="submit"
                variant="contained"
              >
                Submit
              </LoadingButton>
            ) : (
              <Button
                fullWidth
                onClick={() => dispatch(setIsWalletModalOpen(true))}
                size="large"
                sx={{
                  color: theme.palette.grey.A400,
                }}
                variant="contained"
              >
                Connect wallet
              </Button>
            )}
          </Card>
        </form>
        <FormStepper depositDatas={depositDatas} superWhitelisted={superWhitelisted} whitelisted={whitelisted} />
      </FormProvider>
    </Card>
  );
};

export default RegisterEthDoForm;
