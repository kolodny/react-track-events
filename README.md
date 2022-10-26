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
  console.log(event);
});

// Create a simple tracker for a div
const Div = trackElement('div');

// Create a tracker for a Material Slider
const MySlider = trackElement(Slider);

const Component: React.FunctionComponent = () => {
  return (
    <>
      {/* Can be used without having an onClick event bound */}
      <Div trackClick>Click me</Div>
      {/**/}
      {/* Can add more info to the event object, ie `event.info === 'my-event'` */}
      <Div trackClick="my-event">Click me</Div>
      {/* Can add more info to the event passed to createTracker as `info.custom` */}
      <Div trackClick={(event) => ({ custom: 'here' })}>Click me</Div>
      {/**/}
      {/* Works on all React components */}
      <MySlider trackChange />
      <MySlider
        onChange={(_mouseEvent, value) => console.log('changed', value)}
        trackChange={(_mouseEvent, numberValue) => ({ numberValue })}
      />
    </>
  );
};
```
