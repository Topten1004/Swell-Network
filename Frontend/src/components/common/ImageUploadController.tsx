import { useRef } from 'react';

import { Button, styled } from '@mui/material';

import getImageLink from '../../utils/getImageLink';

type ImageUploadControllerProps = {
  id: string;
  value?: string | null;
  buttonName: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const ImageContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '2rem',
}));

const ImageUploadController: React.FC<ImageUploadControllerProps> = ({ id, value, buttonName, onChange }) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label htmlFor={id} style={{ marginBottom: 16 }}>
      <input accept="image/*" id={id} onChange={onChange} ref={ref} style={{ display: 'none' }} type="file" />

      <ImageContainer>
        {value && <img alt="" src={getImageLink(value) || ''} style={{ height: 48, marginRight: 16 }} />}
        <Button component="span" variant="contained">
          {buttonName}
        </Button>
      </ImageContainer>
    </label>
  );
};
export default ImageUploadController;
