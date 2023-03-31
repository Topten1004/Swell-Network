/* eslint-disable no-param-reassign */
import { FC, useRef, useState } from 'react';

import { Box, styled } from '@mui/material';

function getSnapshot(src: HTMLImageElement, canvas: HTMLCanvasElement, targetHeight: number) {
  const context = canvas.getContext('2d');

  if (context) {
    let { width, height } = src;

    // src may be hidden and not have the target dimensions
    const ratio = width / height;
    height = targetHeight;
    width = Math.round(ratio * targetHeight);

    // Ensure crispness at high DPIs
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.scale(devicePixelRatio, devicePixelRatio);

    context.clearRect(0, 0, width, height);
    context.drawImage(src, 0, 0, width, height);
  }
}

const NFTImage = styled('img')({
  gridArea: 'overlap',
  height: '400px',
  zIndex: 1,
  position: 'absolute',
  left: 0,
  top: 0,
});

const NFT: FC<{ image: string; height: number }> = ({ image, height: targetHeight }) => {
  const [animate, setAnimate] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <Box
      onMouseEnter={() => {
        setAnimate(true);
      }}
      onMouseLeave={() => {
        // snapshot the current frame so the transition to the canvas is smooth
        if (imageRef.current && canvasRef.current) {
          getSnapshot(imageRef.current, canvasRef.current, targetHeight);
        }
        setAnimate(false);
      }}
      sx={{
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <canvas ref={canvasRef} />
      <NFTImage
        hidden={!animate}
        onLoad={() => {
          // snapshot for the canvas
          if (imageRef.current && canvasRef.current) {
            getSnapshot(imageRef.current, canvasRef.current, targetHeight);
          }
        }}
        ref={imageRef}
        src={image}
      />
    </Box>
  );
};
export default NFT;
