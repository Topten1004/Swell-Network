// ----------------------------------------------------------------------

import { Typography } from '@mui/material/styles/createTypography';

function pxToRem(value: number) {
  return `${value / 16}rem`;
}

interface ResponsiveFontSizesI {
  sm: number;
  md: number;
  lg: number;
}

export const responsiveFontSizes = ({ lg, md, sm }: ResponsiveFontSizesI): unknown => ({
  '@media (min-width:600px)': {
    fontSize: pxToRem(sm),
  },
  '@media (min-width:900px)': {
    fontSize: pxToRem(md),
  },
  '@media (min-width:1200px)': {
    fontSize: pxToRem(lg),
  },
});

const FONT_PRIMARY = 'Poppins, sans-serif';
const fontSize = 13;

const typography: Partial<Typography> = {
  fontFamily: FONT_PRIMARY,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  fontSize,
  htmlFontSize: fontSize,
  h1: {
    fontWeight: 600,
    lineHeight: 1.2,
    fontSize: 36,
    // ...responsiveFontSizes({ sm: 52, md: 58, lg: 36 })
  },
  h2: {
    fontWeight: 600,
    lineHeight: 1.2,
    fontSize: 36,
    // ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 })
  },
  h3: {
    fontWeight: 600,
    lineHeight: 1.2,
    fontSize: 18,
    // ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 })
  },
  h4: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: 16,
    // ...responsiveFontSizes({ sm: 20, md: 24, lg: 24 })
  },
  h5: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: 14,
    // ...responsiveFontSizes({ sm: 19, md: 20, lg: 20 })
  },
  h6: {
    fontWeight: 700,
    lineHeight: 28 / 18,
    fontSize: 12,
    // ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 })
  },
  subtitle1: {
    fontWeight: 600,
    lineHeight: 1.4,
    fontSize: 16,
  },
  subtitle2: {
    fontWeight: 600,
    lineHeight: 1.4,
    fontSize: 14,
  },
  body1: {
    lineHeight: 1.4,
    fontSize: 14,
  },
  body2: {
    lineHeight: 1.4,
    fontSize: 12,
  },
  caption: {
    lineHeight: 1.4,
    fontSize: 12,
  },
  overline: {
    fontWeight: 700,
    lineHeight: 1.5,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: 600,
    lineHeight: 1.4,
    fontSize,
    textTransform: 'capitalize',
  },
};

export default typography;
