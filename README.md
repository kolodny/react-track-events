# react-track-events

[![NPM version][npm-image]][npm-url]
[![Build status][build-image]][build-url]
[![Downloads][downloads-image]][downloads-url]

Simple React wrapper for Components to track events.

[npm-image]: https://img.shields.io/npm/v/react-track-events.svg?style=flat-square
[npm-url]: https://npmjs.org/package/react-track-events
[build-image]: https://github.com/kolodny/react-track-events/actions/workflows/main.yml/badge.svg
[build-url]: https://github.com/kolodny/react-track-events/actions/workflows/main.yml
[downloads-image]: http://img.shields.io/npm/dm/react-track-events.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/react-track-events

### Usage

```tsx
import { createTracker } from 'react-track-events';

const trackElement = createTracker((event) => {
  const info: { featureName?: string; attributes?: any } = {};
  if (Array.isArray(event.info)) {
    info.featureName = event.info[0];
    info.attributes = event.info[1];
  } else {
    info.featureName = event.info;
  }

  console.log(info);
});

// Create a simple tracker for a div
const Div = trackElement('div');

// Create a div that automatically tracks specific events without
// having to manually add a trackEvent attribute
const AutoTrackDiv = trackElement('div', { alwaysTrack: ['onClick'] });

// Create a tracker for a Material Slider
const MySlider = trackElement(Slider);

const Component: React.FunctionComponent = () => {
  return (
    <>
      {/* Can be used without having an onClick event bound */}
      <Div trackClick>Click me</Div>
      {/* Can add more info to the event object, ie `event.info === 'my-event'` */}
      <Div trackClick="my-event">Click me</Div>
      {/* Can add more info to the event passed to createTracker as `info.custom` */}
      <Div trackClick={['other-event1', { custom: 'here' }]}>Click me</Div>
      <Div trackClick={(e) => ['other-event2', { eventName: e.eventName }]}>
        Click me
      </Div>

      {/* Works on all React components */}
      <MySlider trackChange />
      <MySlider
        onChange={(_mouseEvent, value) => console.log('changed', value)}
        trackChange={(_mouseEvent, numberValue) => [
          'value-changed',
          { numberValue },
        ]}
      />

      {/* Autotracking work as expected */}
      <AutoTrackDiv>tracked</AutoTrackDiv>
      {/* You can still add info */}
      <AutoTrackDiv trackClick="my-event">tracked</AutoTrackDiv>
      {/* You can opt-out of tracking as well */}
      <AutoTrackDiv trackClick={false}>tracked</AutoTrackDiv>
    </>
  );
};
```
