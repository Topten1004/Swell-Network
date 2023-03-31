/* eslint-disable jsx-a11y/anchor-is-valid */
import { FC, useState } from 'react';

import { useMutation } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useWeb3React } from 'web3-react-core';

import { CREATE_OR_UPDATE_USER, GET_NONCE_BY_USER } from '../../../shared/graphql';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import { setIsReferralCodeUpdateModalOpen } from '../../../state/modal/modalSlice';
import { Modal } from '../../../theme/uiComponents';
import { displayErrorMessage } from '../../../utils/errors';

interface IProps {
  referralCode: string;
}

const ReferralCodeUpdateConfirmModal: FC<IProps> = ({ referralCode }) => {
  const { account, library } = useWeb3React();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isReferralCodeUpdateModalOpen } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const [createOrUpdateUser] = useMutation(CREATE_OR_UPDATE_USER);
  const [getNonceByUser] = useMutation(GET_NONCE_BY_USER);

  const onUpdateReferalCode = () => {
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
              createOrUpdateUser({
                variables: {
                  createOrUpdateUserInput: {
                    referralCode,
                    wallet: account,
                  },
                  userSignatureInput: {
                    wallet: account,
                    signature,
                    timestamp,
                  },
                },
                onCompleted(res) {
                  setIsSubmitting(false);
                  if (res.createOrUpdateUser) {
                    enqueueSnackbar('Referral code updated', {
                      variant: 'success',
                    });
                  }
                  dispatch(setIsReferralCodeUpdateModalOpen(false));
                },
                onError(error) {
                  setIsSubmitting(false);
                  enqueueSnackbar(error.message, { variant: 'error' });
                  dispatch(setIsReferralCodeUpdateModalOpen(false));
                },
              });
            } catch (error) {
              setIsSubmitting(false);
              displayErrorMessage(enqueueSnackbar, error);
              dispatch(setIsReferralCodeUpdateModalOpen(false));
            }
          },
          onError(error) {
            setIsSubmitting(false);
            enqueueSnackbar(error.message, { variant: 'error' });
            dispatch(setIsReferralCodeUpdateModalOpen(false));
          },
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      displayErrorMessage(enqueueSnackbar, error);
      dispatch(setIsReferralCodeUpdateModalOpen(false));
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    dispatch(setIsReferralCodeUpdateModalOpen(false));
  };

  return (
    <Modal
      maxWidth="sm"
      onClose={handleClose}
      open={isReferralCodeUpdateModalOpen}
      sx={{
        '& .MuiDialogTitle-root,  & .MuiDialogContent-root': {
          paddingInline: {
            sm: '38px',
          },
        },
        '& .MuiDialogTitle-root button': {
          right: { sm: '20px' },
        },
      }}
      title=""
    >
      <Box
        sx={{
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontWeight: '700',
          fontSize: '22px',
          lineHeight: '150%',
          marginX: 'auto',
          textAlign: 'center',
        }}
      >
        Warning
      </Box>
      <Box
        sx={{
          fontWeight: '500',
          fontSize: '16px',
          lineHeight: '24px',
          maxWidth: '390px',
          marginX: 'auto',
          marginY: '49px',
          textAlign: 'center',
        }}
      >
        If you change your referral code all previous referrals will be lost, click ok to proceed.
      </Box>

      <Card
        sx={{
          maxWidth: '440px',
          margin: '20px auto',
          width: '100%',
        }}
      >
        <LoadingButton
          disabled={isSubmitting}
          fullWidth
          loading={isSubmitting}
          onClick={onUpdateReferalCode}
          size="large"
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
          }}
        >
          Ok
        </LoadingButton>
        <Button
          fullWidth
          onClick={() => dispatch(setIsReferralCodeUpdateModalOpen(false))}
          size="large"
          sx={{ color: theme.palette.grey.A400, marginTop: '17px' }}
        >
          Cancel
        </Button>
      </Card>
    </Modal>
  );
};

export default ReferralCodeUpdateConfirmModal;
