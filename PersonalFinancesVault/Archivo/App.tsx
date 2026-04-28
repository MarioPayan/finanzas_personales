import {useEffect, useState} from 'react'
import steps, {defaultStep} from './steps'
import AppContainer from './components/AppContainer'
import Tabs, {TabType} from './components/Tabs'
import Slide, {SlideDirection} from './components/Slide'
import Score from './components/Score'
import ContentContainer, {externalDivProps} from './components/ContentContainer'
import TabContent from './components/TabContent'
import {defaultTab, getTabFromKey, getTabIndexFromKey, loadTabsFromSteps} from './utils/tabs'

export default function App() {
  const [tabs, setTabs] = useState<TabType[]>([])
  const [score, setScore] = useState<number>(0)
  const [currentTab, setCurrentTab] = useState<TabType>(defaultTab)
  const [currentTabKey, setCurrentTabKey] = useState<TabType['key']>(defaultStep.key)
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('down')
  const [nextTabKey, setNextTabKey] = useState<string | undefined>(undefined)
  const [animationIn, setAnimationIn] = useState(true)

  useEffect(() => {
    loadTabsFromSteps(steps, setTabs, setCurrentTabKey)
  }, [])

  useEffect(() => {
    setCurrentTab(getTabFromKey(currentTabKey, tabs))
  }, [currentTabKey])

  useEffect(() => {
    if (nextTabKey) {
      const newDirection =
        getTabIndexFromKey(nextTabKey, tabs) > getTabIndexFromKey(currentTabKey, tabs)
          ? 'up'
          : 'down'
      setSlideDirection(newDirection)
      setAnimationIn(false)
      setTimeout(() => {
        setCurrentTabKey(nextTabKey)
        setAnimationIn(true)
        setNextTabKey(undefined)
      }, 500)
    }
  }, [nextTabKey])

  return (
    <AppContainer score={score}>
      <Tabs
        tabs={tabs}
        currentTabKey={currentTabKey}
        nextTabKey={nextTabKey}
        setNextTabKey={setNextTabKey}
        score={score}
      />
      <Score score={score} />
      <Slide animationIn={animationIn} slideDirection={slideDirection}>
        <div style={externalDivProps}>
          <ContentContainer>
            <TabContent
              tab={currentTab}
              setNextTabKey={setNextTabKey}
              score={score}
              setScore={setScore}
            />
          </ContentContainer>
        </div>
      </Slide>
    </AppContainer>
  )
}
