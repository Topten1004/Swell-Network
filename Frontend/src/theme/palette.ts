import { alpha, darken, PaletteOptions } from '@mui/material';

const BLACK = '#000';
const WHITE = '#fff';
const PRIMARY = {
  light: 'rgba(0,176,240,0.2)',
  main: '#00B0F0',
  dark: darken('#00B0F0', 0.2),
  contrastText: WHITE,
};

const PRIMARYDARK = {
  light: 'rgba(0,176,240,0.2)',
  main: '#00B0F0',
  dark: darken('#00B0F0', 0.2),
  contrastText: BLACK,
};

const GRAY = {
  '100': '#DCDCDC',
  '200': alpha(BLACK, 0.2),
  '300': '#F3F3F3',
  A200: '#E6E6E6', // input border
  A400: '#F7F7F7', // input disabled color
};

const GRAYDARK = {
  '100': '#DCDCDC',
  '200': alpha(WHITE, 0.2),
  '300': '#F3F3F3',
  A200: '#E6E6E6', // input border
  A400: '#F7F7F7', // input disabled color
};
// const SECONDARY = {
//   main: '#3366FF',
// };
// const INFO = {
//   main: '#1890FF',
// };
const SUCCESS = {
  light: 'rgba(0,240,144,0.2)',
  main: '#00F090',
};
// const WARNING = {
//   light: '#FFE16A',
//   main: '#FFC107',
//   dark: '#B78103',
// };
const ERROR = {
  // lighter: 'rgba(240,64,0,0.2)',
  light: 'rgba(240,64,0,0.2)',
  main: '#F04000',
  // dark: '#B72136',
  // darker: '#7A0C2E',
  // contrastText: '#fff'
};

const BACKGROUND_COLOR = {
  paper: WHITE,
  default: WHITE,
  transparendBg: alpha(WHITE, 0.2),
  bg: `linear-gradient(to top left, ${alpha('#F0F0D2', 0.15)} 0%, ${alpha('#00B0F0', 0.15)} 100%)`,
  primaryGradient: `radial-gradient(circle, #F0F0D2 0%, #00B0F0 100%)`,
  blueGradient: `linear-gradient(to top left, #00B0F0 0%, #f0f0d2 120%)`,
};

const BACKGROUND_DARK_COLOR = {
  paper: BLACK,
  default: BLACK,
  transparendBg: alpha(BLACK, 0.2),
  bg: `linear-gradient(to top left, ${alpha('#002020', 0.85)} 0%, ${alpha('#282828', 1)} 100%)`,
  primaryGradient: `radial-gradient(circle, #F0F0D2 0%, #00B0F0 100%)`,
  blueGradient: `linear-gradient(to top left, #00B0F0 0%, #f0f0d2 120%)`,
};

const paletteLight: PaletteOptions = {
  common: { black: BLACK, white: WHITE },
  primary: { ...PRIMARY },
  grey: { ...GRAY },
  success: { ...SUCCESS },
  // secondary: { ...SECONDARY },
  // info: { ...INFO },
  // warning: { ...WARNING },
  error: { ...ERROR },
  background: { ...BACKGROUND_COLOR },
};

const paletteDark: PaletteOptions = {
  common: { black: WHITE, white: '#111' },
  primary: { ...PRIMARYDARK },
  grey: { ...GRAYDARK },
  success: { ...SUCCESS },
  // secondary: { ...SECONDARY },
  // info: { ...INFO },
  // warning: { ...WARNING },
  error: { ...ERROR },
  background: { ...BACKGROUND_DARK_COLOR },
};

export default { paletteLight, paletteDark };
