import { Components, Theme } from '@mui/material';
import { merge } from 'lodash';

import Accordion from './Accordion';
import Autocomplete from './Autocomplete';
import Backdrop from './Backdrop';
import Button from './Button';
import Card from './Card';
import Chip from './Chip';
import IconButton from './IconButton';
import Input from './Input';
import Lists from './Lists';
import Paper from './Paper';
import Tooltip from './Tooltip';
import Typography from './Typography';

// ----------------------------------------------------------------------

const ComponentsOverrides = (theme: Theme): Components<Theme> =>
  merge(
    Card(theme),
    Lists(theme),
    Paper(),
    Input(theme),
    Button(theme),
    Tooltip(theme),
    Backdrop(theme),
    Typography(theme),
    IconButton(theme),
    Autocomplete(theme),
    Accordion(theme),
    Chip(theme)
  );

export default ComponentsOverrides;
