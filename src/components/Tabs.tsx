import {default as MuiTabs} from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Typography } from '@mui/material';
import useMobile from '../hooks/useMobile';
import { backgroundColorGradiant } from '../utils/colors';
import { StepType } from '../steps';

export type TabType = StepType & { index: number };

type TabsProps = {
  tabs: TabType[],
  currentTabKey: TabType['key'],
  nextTabKey: TabType['key'] | undefined,
  setNextTabKey: (key: TabType['key']) => void,
  score: number,
}

const Tabs = ({
  tabs,
  currentTabKey,
  nextTabKey,
  setNextTabKey,
  score
}: TabsProps): JSX.Element => {
  const isMobile = useMobile();

  return (
    <MuiTabs
      orientation={isMobile ? 'horizontal' : 'vertical'}
      variant="scrollable"
      value={nextTabKey || currentTabKey}
      onChange={(_, value) => setNextTabKey(value)}
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        minWidth: 200,
        backgroundColor: 'rgba(0,0,0,0.5)',
        boxShadow: "5px 0 10px rgba(0,0,0,0.5)",
        ".MuiTabs-indicator": {
          backgroundColor: backgroundColorGradiant(score),
        },
      }}>
      {tabs.map((tab) => (
        <Tab key={tab.key}
          tabIndex={tab.index}
          value={tab.key}
          // disabled={true}
          label={<Typography variant="h6">{tab.label}</Typography>}
          sx={{
            "&.MuiTab-root": {
              color: backgroundColorGradiant(score),
            },
            "&.Mui-selected": {
              color: backgroundColorGradiant(score),
            },
            textTransform: 'capitalize',
          }} />
      ))}
    </MuiTabs>
  );
}

export default Tabs;