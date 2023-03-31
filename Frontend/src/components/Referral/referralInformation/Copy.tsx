import React, { FC } from 'react';

import { styled } from '@mui/material';
import { useSnackbar } from 'notistack';

import CopyIcon from '../../../assets/images/icon-copy.svg';
import useCopyClipboard from '../../../hooks/useCopyClipboard';

interface CopyHelperProps {
  toCopy: string;
  children?: React.ReactNode;
}
const StyledText = styled('p')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  fontFamily: 'Inter',
  fontStyle: 'normal',
  lineHeight: '150%',
  fontSize: 16,
  color: theme.palette.primary.main,
  margin: 0,
}));

const CopyIconWrapper = styled('span')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: '5px',
});

const CopyHelper: FC<CopyHelperProps> = ({ toCopy, children }) => {
  const [, setCopied] = useCopyClipboard();
  const { enqueueSnackbar } = useSnackbar();

  const onCopy = () => {
    setCopied(toCopy);
    enqueueSnackbar('Referral link copied', {
      variant: 'success',
    });
  };

  return (
    // eslint-disable-next-line react/destructuring-assignment, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions,jsx-a11y/interactive-supports-focus
    <span onClick={onCopy} role="button">
      <StyledText>
        {children}
        <CopyIconWrapper>
          <img alt="copy icon" src={CopyIcon} />
        </CopyIconWrapper>
      </StyledText>
    </span>
  );
};

export default CopyHelper;
