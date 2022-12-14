import { Switch } from '@mui/material';
import React from 'react';
import { createTracker } from 'react-track-events';

import './App.css';

const trackElement = createTracker((event) => {
  console.log(event);
});

const Div = trackElement.intrinsicElements.div;
const AutTrackDiv = trackElement.withOptions({ alwaysTrack: ['onClick'] }).div;
const MySwitch = trackElement(Switch);

function App() {
  return (
    <>
      <Component />
    </>
  );
}

const MyComponent: React.FunctionComponent<{
  something: (a: { some: 'thing' }) => void;
}> = (props) => {
  props.something({ some: 'thing' });
  return null;
};
const MyComponentTracked = trackElement(MyComponent);

export default App;

const Component: React.FunctionComponent = () => {
  return (
    <>
      <MyComponentTracked
        track_something="something cool"
        something={() => {}}
      />
      <AutTrackDiv>Logs eventName: undefined</AutTrackDiv>
      <AutTrackDiv trackClick={false}>Doesn't log anything</AutTrackDiv>
      <AutTrackDiv trackClick="test">Logs eventName: 'test'</AutTrackDiv>
      <hr />
      <Div>Doesn't log anything</Div>
      <Div trackClick>Logs eventName: undefined</Div>
      <Div trackClick={false}>Doesn't log anything</Div>
      <Div trackClick="test">Logs eventName: 'test'</Div>
      <Div trackClick={['more', { custom: 'attrs' }]}>
        Logs eventName: 'more', attributes: {'{'}custom: 'attrs'{'}'}
      </Div>
      <hr />
      <label>
        Logs eventName: 'switch-no-info-on-value'
        <MySwitch trackChange="switch-no-info-on-value" />
      </label>
      <br />
      <label>
        Logs eventName: 'switch', attributes: {'{'}checked: true{'}'}
        <MySwitch trackChange={(_e, checked) => ['switch', { checked }]} />
      </label>
      <trackElement.intrinsicElements.div trackClick="cool">
        trackElement.div
      </trackElement.intrinsicElements.div>
    </>
  );
};
