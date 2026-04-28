import Box from '@mui/material/Box';
import { StepOption } from '../steps';
import { Button, Typography } from '@mui/material';
import { TabType } from '../components/Tabs';
import { getScoreWithLimits } from './Score';

type TabContentProps = {
	tab: TabType,
	setNextTabKey: (nextTabKey: TabType['key']) => void,
	score: number,
	setScore: (score: number) => void,
}

const TabContent = ({
	tab,
	setNextTabKey,
	score,
	setScore
}: TabContentProps) => {

	const doButtonAction = (action: Omit<StepOption, 'label'>) => {
		if (action.points) {
			setScore(getScoreWithLimits(score + action.points, -100, 100));
		}
		if (action.nextStep) {
			setNextTabKey(action.nextStep);
		}
	}

	return (
		<>
			{tab.content.question && (
				<Typography
					variant="h3"
					textAlign="center"
				>
					{tab.content.question}
				</Typography>
			)}
			{tab.content.options && tab.content.options.length > 0 && (
				<Box
					display="flex"
					flexDirection="row">
					{tab.content.options?.map((option: StepOption, index: number) => (
						<Box key={index} padding={1}>
							<Button
								variant='contained'
								onClick={() => doButtonAction(option)}>
								{option.label}
							</Button>
						</Box>
					))}
				</Box>
			)}
			{tab.content.description && (
				<Typography variant="body1">
					{tab.content.description}
				</Typography>
			)}</>
	);
}

export default TabContent