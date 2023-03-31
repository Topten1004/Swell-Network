import * as React from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';
import { useParams } from 'react-router';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectProps } from '@mui/material';
import { ethers } from 'ethers';
import { useWeb3React } from 'web3-react-core';

import { useV3Positions } from '../../hooks/useV3Positions';
import { useVaultDetail } from '../../hooks/useVault';
import { SwellIcon } from '../../theme/uiComponents';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
export enum VaultTransactionType {
  ENTER = 'ENTER',
  EXIT = 'EXIT',
}

type Options = { name: string; swEthBalance: string };

type IMultiSelectProps = SelectProps & {
  rules?: ControllerProps['rules'];
  shouldUnregister?: ControllerProps['shouldUnregister'];
  name: string;
  // options: Options[] | string[];
  defaultValue?: string[];
  vaultTransactionType?: VaultTransactionType;
};

const ChoosePosition: React.FC<IMultiSelectProps> = ({
  name,
  label,
  defaultValue,
  shouldUnregister,
  type,
  rules,
  required,
  placeholder,
  vaultTransactionType,
  sx,
  ...props
}) => {
  const { control } = useFormContext();
  const { account } = useWeb3React();

  const { positions } = useV3Positions(account);

  const { index } = useParams<{ index: string }>();

  const { vaultDetail } = useVaultDetail(Number(index) - 1, account);

  const enterVaultPositions = positions
    ?.filter((position) => Number(ethers.utils.formatEther(position.baseTokenBalance)) > 0)
    .map((position) => {
      const formattedTokenId = position.tokenId.toString().split('.')[0];
      const formattedBaseTokenBalance = ethers.utils.formatEther(position.baseTokenBalance).split('.')[0];
      return {
        name: formattedTokenId,
        swEthBalance: formattedBaseTokenBalance,
      };
    }) as Options[];

  const exitVaultPositions = vaultDetail?.positions.map((position) => {
    const formattedTokenId = position.position.toString();
    const formattedValue = ethers.utils.formatEther(position.balance.toString()).split('.')[0];
    return {
      name: formattedTokenId,
      swEthBalance: formattedValue,
    };
  }) as Options[];

  const options = vaultTransactionType === VaultTransactionType.ENTER ? enterVaultPositions : exitVaultPositions;

  return (
    <Controller
      control={control}
      defaultValue={defaultValue || ''}
      name={name}
      render={({ field: { ref, onChange, value, ...fields }, fieldState: { error, invalid } }) => (
        <FormControl error={invalid} fullWidth>
          {label && (
            <InputLabel htmlFor={`label-${label}`} id={`label-${label}`} shrink>
              {label}
            </InputLabel>
          )}
          <Select
            {...props}
            displayEmpty
            fullWidth
            IconComponent={KeyboardArrowDownIcon}
            id={`label-${label}`}
            labelId={`label-${label}`}
            MenuProps={MenuProps}
            onChange={onChange}
            value={value || ''}
            {...fields}
            inputProps={{
              ref,
            }}
            renderValue={(selected: Options) => (
              <>
                {selected ? (
                  <Box sx={{ fontSize: '11px' }}>
                    UNIQUE NFT NUMBER {selected?.name}
                    <Box sx={{ fontSize: '13px', fontWeight: 400, '& small': { fontSize: '10px', opacity: 0.5 } }}>
                      <SwellIcon /> {Number(selected?.swEthBalance || 0).toFixed(2)} <small>Available</small>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ paddingBlock: '6px' }}> {placeholder || 'Choose position'}</Box>
                )}
              </>
            )}
            sx={{
              '& .MuiSelect-select': {
                paddingBlock: '10px',
                minHeight: '31px !important',
                paddingRight: '14px !important',
              },
              ...sx,
            }}
          >
            {options &&
              options.map((option) => (
                <MenuItem key={option.name} value={option as any}>
                  <Box>
                    UNIQUE NFT NUMBER {option.name}
                    <Box sx={{ fontSize: '13px', fontWeight: 400, '& small': { fontSize: '10px', opacity: 0.5 } }}>
                      <SwellIcon /> {Number(option.swEthBalance).toFixed(2)} <small>Available</small>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
          </Select>
          {error?.message && <FormHelperText>{error?.message}</FormHelperText>}
        </FormControl>
      )}
      rules={{ required, ...rules }}
      shouldUnregister={shouldUnregister}
    />
  );
};
export default ChoosePosition;
