import { render } from '@testing-library/react';
import { createTracker } from 'react-track-events';
import { Slider } from '@mui/material';
import React from 'react';

describe('div', () => {
  test('simple', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.intrinsicElements.div;
    const { container } = render(<Div trackClick>Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick' })
    );
  });

  test('with id', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.intrinsicElements.div;
    const { container } = render(<Div trackClick="my-event">Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'my-event' })
    );
  });

  test('with callback', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.intrinsicElements.div;
    const { container } = render(
      <Div trackClick={(e) => e.type.toUpperCase()}>Test</Div>
    );
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'CLICK' })
    );
  });

  test('with ref', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.intrinsicElements.div;
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(
      <Div about="me" ref={ref} trackClick>
        Test
      </Div>
    );
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(ref.current?.getAttribute('about')).toBe('me');
  });
});

describe('Component', () => {
  test('simple', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const MySlider = trackElement(Slider);
    const { container } = render(<MySlider trackClick />);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick' })
    );
  });

  test('with id', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const MySlider = trackElement(Slider);
    const { container } = render(<MySlider trackClick="my-event" />);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'my-event' })
    );
  });

  test('with callback', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const MySlider = trackElement(Slider);
    const { container } = render(
      <MySlider trackClick={(e) => e.type.toUpperCase()} />
    );
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'CLICK' })
    );
  });

  test('with ref', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const MySlider = trackElement(Slider);
    const ref = { current: null as HTMLDivElement | null };
    const { container } = render(<MySlider about="me2" ref={ref} trackClick />);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(ref.current?.getAttribute('about')).toBe('me2');
  });
});

test('works on non onFoo functions', () => {
  const Component: React.FunctionComponent<{
    somethingRandom?: (a: { random: true }) => void;
  }> = (props) => {
    props.somethingRandom?.({ random: true });
    return <div />;
  };
  const spy = jest.fn();
  const trackElement = createTracker(spy);
  const MyComponent = trackElement(Component);
  render(<MyComponent track_somethingRandom />);
  expect(spy).toHaveBeenCalledWith(
    expect.objectContaining({ eventName: 'somethingRandom' })
  );
});

describe('always track', () => {
  test('simple', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.withOptions({ alwaysTrack: ['onClick'] }).div;
    const { container } = render(<Div>Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick' })
    );
  });

  test('passed false', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.withOptions({ alwaysTrack: ['onClick'] }).div;
    const { container } = render(<Div trackClick={false}>Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).not.toHaveBeenCalled();
  });

  test('with id', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement.withOptions({ alwaysTrack: ['onClick'] }).div;
    const { container } = render(<Div trackClick="my-event">Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'my-event' })
    );
  });
});

test('typings work', () => {
  const trackUntyped = createTracker(() => {});
  const trackTyped = createTracker<'tYpEd'>(() => {});
  let element: JSX.Element;

  const UntypedDiv = trackUntyped.intrinsicElements.div;
  element = <UntypedDiv />;
  element = <UntypedDiv trackClick />;
  element = <UntypedDiv trackClick={false} />;
  element = <UntypedDiv trackClick="123" />;
  element = <UntypedDiv trackClick={123} />;
  element = <UntypedDiv trackClick={() => 123} />;

  const UntypedDivAlways = trackUntyped.withOptions({
    alwaysTrack: ['onClick'],
  }).div;
  // @ts-expect-error
  trackUntyped('div', { alwaysTrack: ['onNone'] });
  element = <UntypedDivAlways />;
  element = <UntypedDivAlways trackClick />;
  element = <UntypedDivAlways trackClick={false} />;
  element = <UntypedDivAlways trackClick="123" />;
  element = <UntypedDivAlways trackClick={123} />;
  element = <UntypedDivAlways trackClick={() => 123} />;

  const TypedDiv = trackTyped.intrinsicElements.div;
  element = <TypedDiv trackClick="tYpEd" />;
  element = <TypedDiv trackClick={() => 'tYpEd'} />;
  element = <TypedDiv />;
  // @ts-expect-error
  element = <TypedDiv trackClick />;
  element = <TypedDiv trackClick={false} />;
  // @ts-expect-error
  element = <TypedDiv trackClick="123" />;
  // @ts-expect-error
  element = <TypedDiv trackClick={123} />;
  // @ts-expect-error
  element = <TypedDiv trackClick={() => 123} />;

  const TypedDivAlways = trackTyped.withOptions({
    alwaysTrack: ['onClick'],
  }).div;
  // @ts-expect-error
  trackTyped('div', { alwaysTrack: ['onNone'] });
  element = <TypedDivAlways trackClick="tYpEd" />;
  element = <TypedDivAlways trackClick={() => 'tYpEd'} />;
  // @ts-expect-error
  element = <TypedDivAlways />;
  // @ts-expect-error
  element = <TypedDivAlways trackClick />;
  element = <TypedDivAlways trackClick={false} />;
  // @ts-expect-error
  element = <TypedDivAlways trackClick="123" />;
  // @ts-expect-error
  element = <TypedDivAlways trackClick={123} />;
  // @ts-expect-error
  element = <TypedDivAlways trackClick={() => 123} />;

  const UntypedSlider = trackUntyped(Slider);
  element = <UntypedSlider />;
  element = <UntypedSlider trackClick />;
  element = <UntypedSlider trackClick={false} />;
  element = <UntypedSlider trackClick="123" />;
  element = <UntypedSlider trackClick={123} />;
  element = <UntypedSlider trackClick={() => 123} />;

  const UntypedSliderAlways = trackUntyped(Slider, {
    alwaysTrack: ['onClick'],
  });
  // @ts-expect-error
  trackUntyped(Slider, { alwaysTrack: ['onNone'] });
  element = <UntypedSliderAlways />;
  element = <UntypedSliderAlways trackClick />;
  element = <UntypedSliderAlways trackClick={false} />;
  element = <UntypedSliderAlways trackClick="123" />;
  element = <UntypedSliderAlways trackClick={123} />;
  element = <UntypedSliderAlways trackClick={() => 123} />;

  const TypedSlider = trackTyped(Slider);
  element = <TypedSlider trackClick="tYpEd" />;
  element = <TypedSlider trackClick={() => 'tYpEd'} />;
  element = <TypedSlider />;
  // @ts-expect-error
  element = <TypedSlider trackClick />;
  element = <TypedSlider trackClick={false} />;
  // @ts-expect-error
  element = <TypedSlider trackClick="123" />;
  // @ts-expect-error
  element = <TypedSlider trackClick={123} />;
  // @ts-expect-error
  element = <TypedSlider trackClick={() => 123} />;

  const TypedSliderAlways = trackTyped(Slider, { alwaysTrack: ['onClick'] });
  // @ts-expect-error
  trackTyped(Slider, { alwaysTrack: ['onNone'] });
  element = <TypedSliderAlways trackClick="tYpEd" />;
  element = <TypedSliderAlways trackClick={() => 'tYpEd'} />;
  // @ts-expect-error
  element = <TypedSliderAlways />;
  // @ts-expect-error
  element = <TypedSliderAlways trackClick />;
  element = <TypedSliderAlways trackClick={false} />;
  // @ts-expect-error
  element = <TypedSliderAlways trackClick="123" />;
  // @ts-expect-error
  element = <TypedSliderAlways trackClick={123} />;
  // @ts-expect-error
  element = <TypedSliderAlways trackClick={() => 123} />;

  interface FakeMap {
    is: 'a map';
  }
  interface Props {
    loaded?: (map: FakeMap) => void;
  }
  const Map: React.FunctionComponent<Props> = () => <div />;
  const TrackedMap = trackTyped(Map);
  element = <TrackedMap />;
  // @ts-expect-error
  element = <TrackedMap track_loaded />;
  element = <TrackedMap track_loaded="tYpEd" />;
  element = (
    <TrackedMap
      track_loaded={(map) => (map.is === 'a map' ? 'tYpEd' : 'tYpEd')}
    />
  );

  // @ts-expect-error
  trackTyped(Map, { alwaysTrack: ['load'] });
  const TrackedMapAlways = trackTyped(Map, { alwaysTrack: ['loaded'] });
  // @ts-expect-error
  element = <TrackedMapAlways />;
  // @ts-expect-error
  element = <TrackedMap track_loaded />;
  element = <TrackedMap track_loaded="tYpEd" />;
  element = (
    <TrackedMap
      track_loaded={(map) => (map.is === 'a map' ? 'tYpEd' : 'tYpEd')}
    />
  );

  if (element) void undefined; // Get rid of lint error
});
