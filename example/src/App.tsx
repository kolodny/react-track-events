import { Slider } from '@mui/material';
import React from 'react';
import { createTracker } from 'react-track-events';

const trackElement = createTracker((event) => {
  console.log(event);
  if (event.info) console.log({ i: event.info });
  console.log([...event.instance.classList.values()]);
});
const Div = trackElement('div');
const MySlider = trackElement(Slider);

function App() {
  return (
    <>
      <Component />
    </>
  );
}

export default App;

const Component: React.FunctionComponent = () => {
  const ref1 = React.useRef<HTMLDivElement>(null);
  const ref2 = React.useRef<HTMLDivElement>(null);
  const ref3 = React.useRef<HTMLDivElement>(null);
  const ref4 = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <Div trackClick className="1" ref={ref1}>
        Click me
      </Div>
      <hr />
      <hr />
      <Div
        trackClick={(event) => ({ custom: 'here' })}
        ref={ref2}
        className="2"
      >
        Click me
      </Div>
      <hr />
      <MySlider ref={ref3} className="3" trackChange trackClick />
      <MySlider
        ref={ref4}
        className="4"
        onChange={(_mouseEvent, value) => console.log('changed', value)}
        trackChange={(_mouseEvent, numberValue) => ({ numberValue })}
        trackClick
      />
    </>
  );
};
