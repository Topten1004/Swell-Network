import { memo } from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';

import { InfoOutlined } from '@mui/icons-material';
import { InputAdornment, InputLabel, styled, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import MuiTextField, { TextFieldProps } from '@mui/material/TextField';
import { BigNumber, ethers } from 'ethers';
import { useWeb3React } from 'web3-react-core';

import { SWETH } from '../../constants/tokens';
import { useNativeCurrencyBalances, useTokenBalance } from '../../state/wallet/hooks';
import { EthereumIcon, SwellIcon } from '../../theme/uiComponents';
import { FormatNumber } from './FormatNumber';
import InputButtons from './InputButtons';

interface FieldProps {
  adornmentType: 'text' | 'node';
  tooltip?: React.ReactNode;
  text?: string;
  icon?: 'swell' | 'eth';
  name: string;
  rules?: ControllerProps['rules'];
  shouldUnregister?: ControllerProps['shouldUnregister'];
  disabled?: boolean;
  maxAmount?: BigNumber;
}

const MTextField = styled(MuiTextField)(({ theme }) => ({
  root: {
    marginBottom: '16px !important',
    width: 'auto',
  },
  '& svg + .MuiInputBase-input': {
    marginLeft: 5,
  },
  '& .MuiInputBase-input': {
    width: 'auto',
    maxWidth: 60,
  },
  '& .MuiInputAdornment-positionStart': {
    marginTop: '0 !important',
    marginRight: 5,
  },
  '& .MuiInputAdornment-positionEnd': {
    color: theme.palette.common.black,
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    '&.flex-end': {
      justifyContent: 'flex-end',
    },
  },
}));

const PriceInput: React.FC<TextFieldProps & FieldProps> = ({
  adornmentType,
  name,
  text,
  tooltip,
  defaultValue,
  disabled,
  icon = 'eth',
  rules,
  required,
  shouldUnregister,
  maxAmount,
  ...props
}) => {
  const theme = useTheme();
  const matches = useMediaQuery(`(max-width: ${theme.breakpoints.values.sm}px)`);
  const { control } = useFormContext();
  const { account, chainId } = useWeb3React();

  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? ''];
  const userSwETHBalance = useTokenBalance(account ?? undefined, chainId ? SWETH[chainId] : undefined);

  let maxValue = 0;
  if (maxAmount) {
    maxValue = parseInt(
      // eslint-disable-next-line no-underscore-dangle
      ethers.utils.parseEther(maxAmount.toString()).div(ethers.utils.parseEther('1'))._hex,
      16
    );
  } else {
    if (icon === 'eth' && userEthBalance) {
      maxValue = parseInt(
        // eslint-disable-next-line no-underscore-dangle
        ethers.utils.parseEther(userEthBalance.toFixed()).div(ethers.utils.parseEther('1'))._hex,
        16
      );
    }
    if (icon === 'swell' && userSwETHBalance) {
      maxValue = parseInt(
        // eslint-disable-next-line no-underscore-dangle
        ethers.utils.parseEther(userSwETHBalance.toFixed()).div(ethers.utils.parseEther('1'))._hex,
        16
      );
    }
  }
  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name={name}
      render={({ field: { ref, value, onChange, ...fields }, fieldState: { invalid, error } }) => (
        <>
          {matches && adornmentType === 'text' && text && (
            <InputLabel sx={{ textAlign: 'left', color: theme.palette.common.black, marginBottom: '8px' }}>
              {text}
            </InputLabel>
          )}
          <MTextField
            {...props}
            {...fields}
            disabled={disabled}
            error={invalid}
            fullWidth
            helperText={error?.message}
            inputProps={{
              maxLength: maxValue,
            }}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={{
              ref,
              inputComponent: FormatNumber as any,
              endAdornment: (
                <InputAdornment className={text ? 'flex-end' : ''} position="end">
                  {adornmentType === 'node' && tooltip && (
                    <>
                      <Tooltip title={<>{tooltip}</>}>
                        <InfoOutlined sx={{ fontSize: '12px' }} />
                      </Tooltip>
                      <InputButtons
                        currency={icon}
                        inputName={name}
                        maxAmount={ethers.utils.parseUnits(maxValue.toString())}
                      />
                    </>
                  )}
                  {!matches && adornmentType === 'text' && text && <>{text}</>}
                </InputAdornment>
              ),
              startAdornment: (
                <>
                  {icon && icon === 'swell' ? (
                    <SwellIcon sx={{ minWidth: '12px', width: '12px' }} />
                  ) : (
                    <EthereumIcon sx={{ minWidth: '12px', width: '12px' }} />
                  )}
                </>
              ),
              value,
            }}
            label=""
            onChange={(e) => (Number(e.target.value) <= maxValue ? onChange(e) : onChange(maxValue))}
            placeholder="Amount"
            value={value}
          />
        </>
      )}
      rules={{ required, ...rules }}
      shouldUnregister={shouldUnregister}
    />
  );
};

export default memo(PriceInput);
