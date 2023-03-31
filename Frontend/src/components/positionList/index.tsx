import { FC } from 'react';

import { PositionDetails } from '../../types/position';
import PositionsListItem from './PositionsListItem';

type PositionListProps = {
  positions: PositionDetails[];
};

const PositionsList: FC<PositionListProps> = ({ positions }) => (
  <>
    {positions.map((position) => (
      <PositionsListItem key={position.tokenId.toString()} position={position} />
    ))}
  </>
);

export default PositionsList;
