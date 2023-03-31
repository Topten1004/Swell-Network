import React from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

// eslint-disable-next-line import/prefer-default-export
export const FormatNumber = React.forwardRef<NumberFormatProps, CustomProps>((props, ref) => {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      allowNegative={false}
      decimalScale={0}
      fixedDecimalScale
      getInputRef={ref}
      inputMode="numeric"
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      thousandSeparator
    />
  );
});
