import { FC, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import depositDataExmaple from '../../assets/json/depositDataExample.json';
import { setCurrentStep } from '../../state/formStepper/formStepperSlice';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { setSelectedPublicKey, setSubmissionStatus } from '../../state/registerNodeOperator/registerNodeOperatorSlice';
import InputController from '../common/InputController';

interface ISubmitDepositDataFormProps {
  depositDatas: any;
}

// eslint-disable-next-line import/prefer-default-export
export const SubmitDepositDataForm: FC<ISubmitDepositDataFormProps> = ({ depositDatas }) => {
  const { watch, reset, setValue } = useFormContext();
  const publicKey = watch('publicKey');

  const { currentStep, depositDataLength } = useAppSelector((state) => state.formStepper);
  const dispatch = useAppDispatch();
  const depositDataPlaceholder = String('Deposit data example:\n') + JSON.stringify(depositDataExmaple, null, '    ');

  useEffect(() => {
    if (publicKey) {
      dispatch(setSelectedPublicKey(publicKey));
      if (depositDatas && depositDatas.length > 0) {
        const isDepositDataCompleted = depositDatas.length === depositDataLength;
        if (isDepositDataCompleted) {
          dispatch(setSubmissionStatus(true));
        } else {
          dispatch(setSubmissionStatus(false));
        }
        const currentDepositData = depositDatas.find(
          (depositData: { amount: string }) => (currentStep + 1).toString() === depositData.amount
        );
        if (currentDepositData) {
          reset({
            totalEth: `${currentDepositData.amount}`,
            publicKey,
            signature: currentDepositData.signature,
            depositDataRoot: currentDepositData.depositDataRoot,
            depositData: '',
          });
        } else {
          reset({
            totalEth: `${currentStep + 1}`,
            publicKey,
          });
        }
      }
    } else {
      dispatch(setSelectedPublicKey(''));
      dispatch(setSubmissionStatus(false));
      dispatch(setCurrentStep(0));
      reset({ totalEth: `${currentStep + 1}`, depositData: '' });
    }
  }, [currentStep, dispatch, publicKey, reset, setValue, depositDatas, depositDataLength]);

  return (
    <>
      <InputController disabled label="ETH amount" name="totalEth" placeholder="ETH amount" required />
      <InputController disabled label="Signature" name="signature" placeholder="" />
      <InputController disabled label="Deposit data root" name="depositDataRoot" placeholder="" />
      <InputController
        label="Deposit data (JSON)"
        multiline
        name="depositData"
        placeholder={depositDataPlaceholder}
        required
        rows={9}
      />
    </>
  );
};
