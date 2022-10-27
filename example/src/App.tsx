import { Switch } from '@mui/material';
import React from 'react';
import { createTracker } from 'react-track-events';

import './App.css';

const trackElement = createTracker((event) => {
  const info: { eventName?: string; attributes?: any } = {};
  if (Array.isArray(event.info)) {
    info.eventName = event.info[0];
    info.attributes = event.info[1];
  } else {
    info.eventName = event.info;
  }

  console.log(info);
});
const Div = trackElement('div');
const AutTrackDiv = trackElement('div', { alwaysTrack: ['onClick'] });
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
    </>
  );
};
