import * as React from 'react';
import { Controller, ControllerProps, useFormContext } from 'react-hook-form';

import { Close } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Theme,
} from '@mui/material';

import NodeOperatorIcon from './NodeOperatorIcon';

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

type Options = { label: string; value: string; logo?: string };

type IMultiSelectProps = SelectProps & {
  rules?: ControllerProps['rules'];
  shouldUnregister?: ControllerProps['shouldUnregister'];
  name: string;
  options: Options[] | string[];
  defaultValue?: string[];
};

const MultiSelect: React.FC<IMultiSelectProps> = ({
  name,
  label,
  defaultValue,
  shouldUnregister,
  type,
  rules,
  required,
  placeholder,
  options,
  sx,
  ...props
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name={name}
      render={({ field: { ref, value, ...fields }, fieldState: { error, invalid } }) => (
        <FormControl error={invalid} fullWidth>
          {label && (
            <InputLabel htmlFor={`label-${label}`} id={`label-${label}`} shrink>
              {label}
            </InputLabel>
          )}
          <Select
            {...props}
            fullWidth
            IconComponent={KeyboardArrowDownIcon}
            id={`label-${label}`}
            labelId={`label-${label}`}
            MenuProps={MenuProps}
            multiple
            value={value || []}
            {...fields}
            inputProps={{
              ref,
            }}
            renderValue={(selected: string[]) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.length > 0 &&
                  selected.map((_value) => {
                    const index = options.findIndex((option) => {
                      if (typeof option === 'string') {
                        return option === _value;
                      }
                      return option.value === _value;
                    });
                    return (
                      <Chip
                        deleteIcon={
                          <Close
                            fontSize="medium"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const i = selected.indexOf(_value);
                              selected.splice(i, 1);
                              fields.onChange([...selected]);
                            }}
                            sx={{ fill: (theme: Theme) => theme.palette.primary.main, marginLeft: '7px !important' }}
                          />
                        }
                        key={typeof _value === 'string' ? _value : (options as Options[])[index]?.value}
                        label={typeof _value === 'string' ? _value : (options as Options[])[index]?.label}
                        onDelete={(e) => {
                          e.preventDefault();
                        }}
                        // onDelete={() => handleDelete(value)}
                        sx={{
                          color: (theme) => `${theme.palette.common.black} !important`,
                          height: '31px !important',
                          fontSize: '13px',
                          paddingLeft: '11px',
                          paddingRight: '5px',
                        }}
                      />
                    );
                  })}
              </Box>
            )}
            sx={{
              '& .MuiSelect-select': {
                paddingBlock: '10px',
                minHeight: '31px !important',
              },
              ...sx,
            }}
          >
            {options.length > 0 &&
              options.map((option) => (
                <MenuItem
                  key={typeof option === 'string' ? option : option.value}
                  value={typeof option === 'string' ? option : option.value}
                >
                  {typeof option === 'string' ? (
                    option
                  ) : (
                    <>
                      <NodeOperatorIcon
                        logo={option.logo}
                        style={{ width: 24, height: 24, minWidth: 24, marginRight: '1rem' }}
                      />
                      {option.label}
                    </>
                  )}
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
export default MultiSelect;
