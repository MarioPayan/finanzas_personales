import { TabType } from "../components/Tabs";
import steps, { StepType } from "../steps";

export const stepToTab = (step: StepType, index: number): TabType => ({ ...step, index })

export const defaultTab = stepToTab(steps[0], -1)

export const loadTabsFromSteps = (
  steps: StepType[],
  setTabs: (tabs: TabType[]) => void,
  setCurrentTabKey: (key: TabType['key']) => void
) => {
  const newTabs = steps.map((step, index) => ({ ...step, index }));
  setTabs(newTabs);
  if (newTabs.length > 0) {
    setCurrentTabKey(newTabs[0].key);
  }
}

export const getTabFromKey = (
  key: TabType['key'],
  tabs: TabType[],
): TabType => {
  return tabs.find((tab) => tab.key === key) || defaultTab
};

export const getTabIndexFromKey = (
  key: TabType['key'],
  tabs: TabType[],
) => {
  return tabs.find((tab) => tab.key === key)?.index || 0
}