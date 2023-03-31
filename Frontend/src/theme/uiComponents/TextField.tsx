/* eslint-disable react/jsx-max-props-per-line */
import { KeyboardArrowDown } from '@mui/icons-material';
import { MenuItem } from '@mui/material';
import MuiTextField, { TextFieldProps } from '@mui/material/TextField';

type FieldProps = TextFieldProps & {
  options?: { label: string; value: string }[];
};

const TextField: React.FC<FieldProps> = ({ value, select, options, ...props }) =>
  select && options ? (
    <MuiTextField
      select={select}
      {...props}
      fullWidth
      SelectProps={{
        displayEmpty: true,
        IconComponent: KeyboardArrowDown,
      }}
      value={value || ''}
    >
      <MenuItem disabled selected sx={{ display: 'none' }} value="">
        {props.placeholder}
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiTextField>
  ) : (
    <MuiTextField {...props} fullWidth value={value || ''} />
  );

export default TextField;
