import { Controller, ControllerProps, useFormContext } from 'react-hook-form';

import { TextFieldProps } from '@mui/material';

import TextField from '../../theme/uiComponents/TextField';
import { FormatNumber } from './FormatNumber';

type InputControllerProps = TextFieldProps & {
  rules?: ControllerProps['rules'];
  shouldUnregister?: ControllerProps['shouldUnregister'];
  name: string;
  options?: { label: string; value: string }[];
  numberFormat?: boolean;
};

const InputController: React.FC<InputControllerProps> = ({
  name,
  label,
  defaultValue,
  shouldUnregister,
  type,
  rules,
  required,
  placeholder,
  numberFormat,
  ...props
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      defaultValue={defaultValue}
      name={name}
      render={({ field: { ref, ...fields }, fieldState: { error, invalid } }) => (
        <TextField
          error={invalid}
          {...fields}
          {...props}
          helperText={error?.message}
          InputProps={{
            inputComponent: numberFormat
              ? (FormatNumber as any) // eslint-disable-line @typescript-eslint/no-explicit-any
              : undefined,
            ref,
            ...props.InputProps,
          }}
          label={label}
          placeholder={`${placeholder}${required ? '*' : ''}`}
          type={type === 'number' ? 'text' : type}
        />
      )}
      rules={{ required, ...rules }}
      shouldUnregister={shouldUnregister}
    />
  );
};
export default InputController;
