import { FC, useLayoutEffect, useMemo, useRef } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import jazzicon from '@metamask/jazzicon';
import { styled } from '@mui/material';
import { useSnackbar } from 'notistack';

import useActiveWeb3React from '../../hooks/useActiveWeb3React';
// import useENSAvatar from '../../hooks/useENSAvatar';

const StyledIdenticon = styled('div')(() => ({
  height: '28px',
  width: '28px',
  borderRadius: '1.125rem',
  fontSize: 'initial',
  overflow: 'hidden',
  marginRight: '8px',
  minWidth: 28,
}));

const Identicon: FC = () => {
  const { account } = useActiveWeb3React();
  const { enqueueSnackbar } = useSnackbar();
  // const { avatar } = useENSAvatar(account ?? undefined);

  const icon = useMemo(() => account && jazzicon(28, parseInt(account.slice(2, 10), 28)), [account]);
  const iconRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line consistent-return
  useLayoutEffect(() => {
    const { current } = iconRef;
    if (icon) {
      current?.appendChild(icon);
      return () => {
        try {
          current?.removeChild(icon);
        } catch (error) {
          enqueueSnackbar('Avatar icon not found', { variant: 'error' });
        }
      };
    }
  }, [icon, iconRef, enqueueSnackbar]);

  return (
    <StyledIdenticon>
      {/* {avatar && fetchable ? (
        <StyledAvatar alt="avatar" onError={() => setFetchable(false)} src={avatar} />
      ) : ( */}
      <span ref={iconRef} />
      {/* )} */}
    </StyledIdenticon>
  );
};

export default Identicon;
