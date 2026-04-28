import { default as MuiSlide } from '@mui/material/Slide';

export type SlideDirection = 'up' | 'down';

type SlideProps = {
  animationIn: boolean,
  slideDirection: SlideDirection,
  children: JSX.Element,
}

const Slide = ({
  animationIn,
  slideDirection,
  children
}: SlideProps) => {
  const getDirection = (
    direction: SlideDirection,
    transitionIn: boolean
  ): SlideDirection => {
    if (transitionIn) {
      return direction;
    } else {
      return { 'up': 'down', 'down': 'up' }[direction] as SlideDirection
    }
  };

  return (
    <MuiSlide
      in={animationIn}
      direction={getDirection(slideDirection, animationIn)}
      appear={true}
      timeout={250}
      mountOnEnter>
      {children}
    </MuiSlide>
  );
}

export default Slide;