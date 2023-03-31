import { FC } from 'react';

import { ResponsiveBar as ResponsiveBarType } from '@nivo/bar';
import styled from 'styled-components';

const round = (num: number, decimals = 3) => Math.round((num + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;

interface Slice {
  name: string;
  value: number;
}

interface Props {
  keyColors: {
    name: string;
    color: string;
  }[];
  data: Slice[];
  isPercent: boolean;
}

const StyledTooltip = styled.div`
  padding: 12px;
  background: #222222;
  color: white;
  ${(color) => `background: ${color}`};
`;

const tooltip = ({ id, value, color }: any) => (
  <StyledTooltip color={color}>
    <strong>
      {id}: {value}%
    </strong>
  </StyledTooltip>
);

const StyledResponsiveBar = styled(ResponsiveBarType)``;

export const SingleBarChart: FC<Props> = ({ keyColors, data, isPercent }) => {
  const keys = keyColors.map((v) => v.name);
  const colors = keyColors.map((v) => v.color);
  const colorMap = keyColors.map((v) => ({ [v.name]: v.color })).reduce((a, b) => ({ ...a, ...b }));

  const chartData = (data.length > 0 ? data : [{ name: 'Other', value: 1 }])
    .map((v) => ({
      [v.name]: isPercent ? round(v.value * 100, 1) : round(v.value, 2),
      [`${v.name}Color`]: colorMap[v.name], // This is utterly bizarre
    }))
    .reduce((a, b) => ({ ...a, ...b }));

  return (
    <StyledResponsiveBar
      borderRadius={2}
      colorBy="id"
      colors={colors}
      data={[chartData]}
      enableGridX={false}
      enableGridY={false}
      indexScale={{ type: 'band', round: true }}
      innerPadding={1}
      isInteractive
      keys={keys}
      labelSkipWidth={25}
      layout="horizontal"
      tooltip={tooltip}
      valueScale={{ type: 'linear' }}
    />
  );
};
