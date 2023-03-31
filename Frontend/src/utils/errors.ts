import { ProviderContext } from 'notistack';

const getErrorMessage = (str: string) => {
  const reason = str?.indexOf('execution reverted: ') === 0 ? str.substr('execution reverted: '.length) : str;
  const text = reason ? reason.split(':') : [];
  const fullText = text.join(', ');
  return fullText.charAt(0).toUpperCase() + fullText.slice(1);
};

const parseGasLimitError = (message: any) => {
  const defaultMessage = 'Unable to determine gas limit';
  try {
    // Find the string reason="" and match anything that isn't a " within the quotes
    const regex = /reason="([^"]+)"/g;
    const reMatch = regex.exec(message);
    if (!reMatch || reMatch.length !== 2) return defaultMessage;
    return reMatch[1];
  } catch (e) {
    return defaultMessage;
  }
};

// eslint-disable-next-line import/prefer-default-export, @typescript-eslint/explicit-module-boundary-types
export const displayErrorMessage = (enqueSnackbar: ProviderContext['enqueueSnackbar'], error: any): void => {
  const err = error as {
    code: number | string | undefined;
    message: string;
    stack: string;
    data: { code: number | string; message: string; data: string };
  };
  let errMessage;
  const errCode = err.code?.toString();
  switch (errCode) {
    case '4001':
      errMessage = 'Transaction rejected by user';
      break;
    case 'UNPREDICTABLE_GAS_LIMIT':
      errMessage = parseGasLimitError(err.message);
      break;
    case 'INSUFFICIENT_FUNDS':
      errMessage = 'Insufficient balance';
      break;
    case '-32603':
      errMessage =
        getErrorMessage(err.data.message) ?? getErrorMessage(err.message) ?? 'Something went wrong. Try again later';
      break;
    case 'INVALID_ARGUMENT':
      errMessage = error?.reason ?? 'Something went wrong. Please try again later.';
      break;
    default:
      errMessage = 'Something went wrong. Please try again later.';
      break;
  }
  enqueSnackbar(errMessage, { variant: 'error' });
};
