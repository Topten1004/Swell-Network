/* eslint-disable no-console */
import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import { ArrowBackIosOutlined, ArrowForwardIosOutlined } from '@mui/icons-material';
import { Box, Theme, Typography } from '@mui/material';

import useWindowSize from '../../hooks/useWindowSize';
import { setCurrentStep } from '../../state/formStepper/formStepperSlice';
import { useAppSelector } from '../../state/hooks';

interface IProps {
  depositDatas: any;
  whitelisted: boolean;
  superWhitelisted: boolean;
}

const FormStepper: React.FC<IProps> = ({ depositDatas, whitelisted, superWhitelisted }) => {
  const dispatch = useDispatch();
  const [nextDisabled, setNextDisabled] = useState(false);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const { watch } = useFormContext();
  const publicKey = watch('publicKey');
  const ref = useRef<HTMLDivElement>();

  const [elementHasScroll, setElementHasScroll] = useState(false);
  const size = useWindowSize();

  const { currentStep } = useAppSelector((state) => state.formStepper);
  const handleClick = (step: number) => {
    dispatch(setCurrentStep(step));
  };
  const scrollLeft = () => {
    if (ref && ref.current) {
      ref.current.scrollLeft -= ref.current.offsetWidth;
      setNextDisabled(false);
      if (ref.current.scrollLeft === 0) {
        setPrevDisabled(true);
      }
    }
  };
  const scrollRight = () => {
    if (ref && ref.current) {
      ref.current.scrollLeft += ref.current.offsetWidth;
      setPrevDisabled(false);
      if (ref.current.clientWidth + ref.current.scrollLeft === ref.current.scrollWidth) {
        setNextDisabled(true);
      }
    }
  };
  useEffect(() => {
    if (ref && ref.current) {
      setElementHasScroll(ref.current.scrollWidth > ref.current.clientWidth);
    }
  }, [size?.width, whitelisted, superWhitelisted]);

  const removeClassFromAllSpans = () => {
    const allSpans = document.getElementsByClassName('stepper')[0].children;
    const allSpansArray = Array.from(allSpans);
    allSpansArray.map((span) => span.classList.remove('active'));
  };

  useEffect(() => {
    removeClassFromAllSpans();
    document.getElementById(`span_${currentStep}`)?.classList.add('active');
  }, [currentStep]);

  return (
    <>
      <Box
        className="stepper"
        ref={ref}
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          scrollBehavior: 'smooth',
          alignItems: 'center',
          justifyItems: 'center',
          backgroundColor: (theme: Theme) => theme.palette.common.white,
          height: 'inherit',
          '& > span': {
            minWidth: ['41px', '32px'],
            lineHeight: ['25px', '20px'],
            display: 'flex',
            borderRight: '2px solid #fff',
            justifyContent: 'center',
            margin: 0,
            color: (theme: Theme) => theme.palette.common.white,
            backgroundColor: (theme) => theme.palette.grey[300],
            '&:first-of-type': { borderRadius: '8px 0 0 8px' },
            '&:last-of-type': { borderRadius: '0 8px 8px 0' },
            flex: 1,
            '&:last-child': {
              borderRight: 0,
            },
            '&.active': {
              // background: (theme) => theme.palette.primary.light,
              // color: (theme) => theme.palette.primary.main,
            },
            '&.completed': {
              background: (theme) => theme.palette.success.main,
              color: (theme) => theme.palette.common.white,
            },
          },
        }}
      >
        {[...Array(superWhitelisted ? 32 : 16 * (Number(whitelisted) + 1) - Number(whitelisted))].map(
          (value, index) => {
            const elmKey = `span_${index}`;
            return (
              // eslint-disable-next-line react/jsx-max-props-per-line
              <Typography
                className={
                  publicKey &&
                  publicKey.length === 98 &&
                  depositDatas &&
                  depositDatas.length > 0 &&
                  depositDatas.find((depositData: { amount: string }) => depositData.amount === (index + 1).toString())
                    ? 'completed'
                    : ''
                }
                component="span"
                id={elmKey}
                key={elmKey}
                onClick={() => handleClick(index)}
                role="button"
              >
                {index + 1}
              </Typography>
            );
          }
        )}
      </Box>

      {elementHasScroll && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '15px',
          }}
        >
          <ArrowBackIosOutlined
            onClick={scrollLeft}
            sx={{
              fontSize: 24,
              cursor: 'pointer',
              pointerEvents: prevDisabled ? 'none' : 'cursor',
              opacity: prevDisabled ? '0.3' : '',
            }}
          />
          <ArrowForwardIosOutlined
            onClick={scrollRight}
            sx={{
              fontSize: 24,
              cursor: 'pointer',
              pointerEvents: nextDisabled ? 'none' : 'cursor',
              opacity: nextDisabled ? '0.3' : '',
            }}
          />
        </Box>
      )}
    </>
  );
};
export default FormStepper;
