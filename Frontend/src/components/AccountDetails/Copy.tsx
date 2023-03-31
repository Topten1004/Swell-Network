import React, { FC } from 'react';
import { CheckCircle, Copy } from 'react-feather';

import { styled } from '@mui/material';

import useCopyClipboard from '../../hooks/useCopyClipboard';

interface CopyHelperProps {
  toCopy: string;
  children?: React.ReactNode;
}
const StyledText = styled('p')(() => ({
  fontWeight: 400,
  lineHeight: 28 / 18,
  fontSize: 14,
  '& svg': {
    marginRight: '5px',
  },
}));

const CopyHelper: FC<CopyHelperProps> = ({ toCopy, children }) => {
  const [isCopied, setCopied] = useCopyClipboard();

  return (
    // eslint-disable-next-line react/destructuring-assignment, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions,jsx-a11y/interactive-supports-focus
    <span onClick={() => setCopied(toCopy)} role="button">
      {isCopied ? (
        <StyledText>
          <CheckCircle size="16" />
          Copied
        </StyledText>
      ) : (
        <StyledText>
          <Copy size="16" />
          {children}
        </StyledText>
      )}
    </span>
  );
};

export default CopyHelper;
