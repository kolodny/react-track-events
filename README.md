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
  // Will be called each time a tracked event is fired with:
  // {
  //   eventName: event like 'onClick',
  //   ComponentType: something like `Dropdown`,
  //   info?: 'whatever you passed to the trackEvent attribute (or return value of it being a function)'
  //   args: [nativeEvent, ...args] // args passed to the event handler,
  //   returnValue?: Whatever the event handler returned
  //   thisContext?: context the event handler was called with;
  // }
});

// Create a simple tracker for a div
const Div = trackElement.trackIntrinsicElement('div');
const trackedDiv = <Div trackClick>I'm being tracked</Div>;

// OR use the returned intrinsicElements object
const tracked = trackElement.intrinsicElements;
const trackedDiv = <tracked.div trackClick>I'm being tracked</tracked.div>;

const untrackedDiv = <Div>I'm not because there's no trackClick attribute</Div>;

const ClickTrackedDiv = trackElement.trackIntrinsicElement('div', {
  alwaysTrack: ['onClick'],
});
// OR
const ClickTrackedDiv = trackElement.withOptions({
  alwaysTrack: ['onClick'],
}).div;

const clickTrackedDiv = <ClickTrackedDiv>I'm being tracked</ClickTrackedDiv>;
const autoTrackedDivWithFocus = (
  <ClickTrackedDiv trackFocus>
    I'm being tracked for clicks and focus
  </ClickTrackedDiv>
);
const noClickTrackedDiv = (
  <ClickTrackedDiv trackClick={false}>Not tracked</ClickTrackedDiv>
);

// You can pass trackClick a value that will be passed to the tracker as the info property
// event.info will be "some info"
const trackedDivWithInfo = <Div trackClick="some info">I'm being tracked</Div>;

// event.info will be `{ foo: 123 }`
const trackedDivWithComplexInfo = <Div trackClick={{ foo: 123 }}>tracked</Div>;

// You can also pass a function will will then pass the return value as the info property
// In this case event.info will be "my-class"
const trackedDivWithFn = (
  <Div className="my-class" trackClick={(e) => e.target.className}>
    Tracked with function
  </Div>
);

// You can track any React element, for example a Material UI Checkbox
const AutoTrackedCheckbox = trackElement(Checkbox, {
  alwaysTrack: ['onChange'],
});
const autoTrackedCheckbox = <AutoTrackedCheckbox />;

const TrackedCheckbox = trackElement(Checkbox);
// The function can pass important info about the event to the onEvent handler
const box = (
  <TrackedCheckbox trackChange={(event, value) => `checkbox-${value}`} />
);
// The above will pass 'checkbox-true' or 'checkbox-false' to the onEvent handler
```

### Typescript

Beside the original typings of the tracked element (eg `form` having `onSubmit`, and `Checkbox` having `onChange`) you can also supply a generic type to `createTracker` to specify the type of the `info` property of the event and what should be passed in the `trackFoo` props.

```tsx
const trackStringyElement = createTracker<string>((event) => {
  // event.info will be a string
});
const Div = trackStringyElement.intrinsicElements.div;
const trackedDivGood = <Div trackClick="some info">I'm being tracked</Div>; // OK
const trackedDivBad1 = <Div>trackClick is required</Div>; // Type Error
const trackedDivBad2 = <Div trackClick>trackClick needs to be a string</Div>; // Type Error

const trackComplexElement = createTracker<
  string | { feature: string; attributes: any }
>((event) => {
  const isString = typeof event.info === 'string';
  const info = isString ? { feature: event.info } : event.info;
  // analytics.track(info);
});
const D2 = trackStringyElement.intrinsicElements('div');
const trackedDiv1 = <D2 trackClick="foo" />; // OK
const trackedDiv2 = <D2 trackClick={{ feature: 'bar', attributes: 123 }} />; // OK
const trackedDiv3 = <D2 trackClick={{ attributes: 123 }} />; // Type Error
```
