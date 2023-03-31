// eslint-disable-next-line import/no-extraneous-dependencies
import { UAParser } from 'ua-parser-js';

const parser = new UAParser(window.navigator.userAgent);
const { type } = parser.getDevice();

export const userAgent = parser.getResult();

export const isMobile = type === 'mobile' || type === 'tablet';
