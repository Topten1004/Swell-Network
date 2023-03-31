import { styled } from '@mui/material';

import DefaultLogo from '../../assets/images/default_logo.svg';
import getImageLink from '../../utils/getImageLink';

const NodeOperatorIcon = styled('div')<{ logo?: string }>(({ logo }) => ({
  height: '35px',
  width: '35px',
  minWidth: '35px',
  borderRadius: '50%',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: `url(${getImageLink(logo) || DefaultLogo})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
}));

export default NodeOperatorIcon;
