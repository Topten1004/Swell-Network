import { Controller, useFormContext } from 'react-hook-form';

import { Autocomplete, TextField } from '@mui/material';

interface Props {
  label?: string;
  placeholder?: string;
  name: string;
  freeSolo?: boolean;
  options: string[];
  loading?: boolean;
}

const AutocompleteController: React.FC<Props> = ({ label, freeSolo, placeholder, name, options, loading }) => {
  const { control } = useFormContext();

  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
          <Autocomplete
            freeSolo={freeSolo}
            loading={loading}
            onChange={(event, item) => {
              onChange(item);
            }}
            onInputChange={(e) => onChange(e)}
            options={options}
            renderInput={(params) => (
              <TextField
                {...params}
                error={invalid}
                helperText={error?.message}
                label={label}
                margin="normal"
                placeholder={placeholder}
                variant="outlined"
              />
            )}
            renderOption={(props: any, option: string) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <li {...props}>
                {`Validator ${props['data-option-index'] + 1} - ${option.slice(0, 6)}...${option.slice(-4)}`}
              </li>
            )}
            value={value}
          />
        )}
        rules={{ required: true }}
      />
    </>
  );
};

export default AutocompleteController;
