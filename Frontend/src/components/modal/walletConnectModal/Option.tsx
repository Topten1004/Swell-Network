import { FC } from 'react';

import { Button, ButtonProps, styled } from '@mui/material';

const OptionCardLeft = styled('div')`
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  height: 100%;
`;
type WalletOptionProps = ButtonProps & {
  clickable?: boolean;
  active?: boolean;
};

const WalletOption = styled(({ clickable, active, ...props }: WalletOptionProps) => <Button {...props} />)`
  background-color: ${({ active, theme }) =>
    active ? 'rgb(206, 208, 217) !important' : theme.palette.grey[theme.palette.mode === 'light' ? '300' : '200']};
  padding: 1rem;
  outline: none;
  border: 1px solid;
  border-radius: 12px;
  width: 100% !important;
  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.palette.primary.dark};
  }
  border-color: ${({ active }) => (active ? 'transparent' : 'rgb(206, 208, 217)')};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  &:hover {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
    border: ${({ clickable, theme }) => (clickable ? `1px solid ${theme.palette.primary.main}` : ``)};
    background-color: ${({ theme }) => (theme.palette.mode === 'light' ? 'rgb(206, 208, 217)' : 'rgb(132, 132, 132)')};
  }
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`;

const GreenCircle = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-of-type {
    height: 8px;
    width: 8px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.palette.success.main};
    border-radius: 50%;
  }
`;

const CircleWrapper = styled('div')`
  color: ${({ theme }) => theme.palette.success.main};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HeaderText = styled('div')`
  display: flex;
  color: ${(props) =>
    props.color === 'blue' ? ({ theme }) => theme.palette.primary.main : ({ theme }) => theme.palette.common.black};
  font-weight: 500;
`;

const SubHeader = styled('div')`
  color: ${({ theme }) => theme.palette.common.black};
  margin-top: 10px;
  font-size: 12px;
`;

const IconWrapper = styled('div')<{ size?: number | null }>`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  & > img,
  span {
    height: ${({ size }) => (size ? `${size}px` : '24px')};
    width: ${({ size }) => (size ? `${size}px` : '24px')};
  }
`;
type OptionsProps = {
  link?: string | null;
  clickable?: boolean;
  size?: number | null;
  onClick?: () => void;
  color: string;
  header: React.ReactNode;
  subheader?: React.ReactNode | null;
  icon: string;
  active?: boolean;
  id: string;
  target?: string;
};

// eslint-disable-next-line import/prefer-default-export
export const Option: FC<OptionsProps> = ({
  link,
  clickable = true,
  size,
  onClick = () => null,
  color,
  header,
  subheader = null,
  icon,
  active = false,
  id,
  target,
}) => {
  const content = (
    <WalletOption
      active={active}
      clickable={clickable && !active}
      color="inherit"
      disableRipple={active}
      id={id}
      onClick={onClick}
    >
      <OptionCardLeft>
        <HeaderText color={color}>
          {active ? (
            <CircleWrapper>
              <GreenCircle>
                <div />
              </GreenCircle>
            </CircleWrapper>
          ) : (
            ''
          )}
          {header}
        </HeaderText>
        {subheader && <SubHeader>{subheader}</SubHeader>}
      </OptionCardLeft>
      <IconWrapper size={size}>
        <img alt="I ̰con" src={icon} />
      </IconWrapper>
    </WalletOption>
  );
  if (link) {
    return (
      <a href={link} rel="noopener noreferrer" target={target}>
        {content}
      </a>
    );
  }

  return content;
};
