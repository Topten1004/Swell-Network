/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';

import { Box, Tabs as MuiTabs, Tab } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Box
      aria-labelledby={`simple-tab-${index}`}
      className="tabs-content"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <>{children}</>}
    </Box>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface ITabs {
  tabs: { label: string; component: React.ReactNode }[];
}

const Tabs: React.FC<ITabs> = ({ tabs }) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const labels: string[] = tabs.map((tab) => tab.label);
  const tabPanels: React.ReactNode[] = tabs.map((tab) => tab.component);

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.common.white,
        height: 'fit-content',
        padding: {
          xs: '20px 10px',
          md: '20px',
        },
        width: '100%',
        marginBottom: '20px',
        borderRadius: '8px',
      }}
    >
      <MuiTabs
        aria-label="basic tabs"
        onChange={handleChange}
        sx={{
          width: '100%',
          justifyContent: 'center',
          display: 'flex',
          minHeight: '36px',
          '& .MuiTabs-scroller': {
            display: 'flex',
            justifyContent: 'center',
            '& .MuiTabs-flexContainer': {
              border: (theme) => `1px solid ${theme.palette.grey[300]}`,
              borderRadius: '18px',
              padding: '2px',
              gap: '5px',
              '& .MuiButtonBase-root': {
                minHeight: '28px',
                fontSize: '18px',
                padding: '2px 26px',
                borderRadius: '18px',
                color: (theme) => theme.palette.common.black,
              },
              '& .Mui-selected': {
                border: (theme) => `1px solid ${theme.palette.grey[300]}`,
                backgroundColor: (theme) => theme.palette.primary.light,
                color: (theme) => theme.palette.primary.main,
              },
              '& + .MuiTabs-indicator': {
                display: 'none',
              },
            },
          },
        }}
        value={value}
      >
        {labels.map((label, index) => {
          const key = `tabs-${index}`;
          return <Tab key={key} label={label} {...a11yProps(index)} />;
        })}
      </MuiTabs>
      {tabPanels.map((component, index) => {
        const key = `tab-panel-${index}`;
        return (
          <TabPanel index={index} key={key} value={value}>
            {component}
          </TabPanel>
        );
      })}
    </Box>
  );
};

export default Tabs;
