import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { BigNumber } from 'ethers';

import PriceInput from '../common/PriceInput';

interface IProps {
  adornmentType: 'text' | 'node';
  tooltip?: React.ReactNode;
  icon?: 'swell' | 'eth';
  name: string;
  watchField: string;
}

// eslint-disable-next-line import/prefer-default-export
export const PrepopulateInputBasedOnSelectedPosition: React.FC<IProps> = ({
  adornmentType,
  icon,
  name,
  tooltip,
  watchField,
}) => {
  const { watch, setValue } = useFormContext();
  const selectedPosition: { name: string; swEthBalance: string } = watch(watchField);
  useEffect(() => {
    if (selectedPosition && selectedPosition.swEthBalance) {
      setValue(name, Number(selectedPosition.swEthBalance));
    }
  }, [selectedPosition, name, setValue]);
  return (
    <PriceInput
      adornmentType={adornmentType}
      icon={icon}
      maxAmount={BigNumber.from(selectedPosition?.swEthBalance || 0)}
      name={name}
      tooltip={tooltip}
    />
  );
};
