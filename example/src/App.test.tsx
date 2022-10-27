import { render } from '@testing-library/react';
import { createTracker } from 'react-track-events';
import { Slider } from '@mui/material';
import React from 'react';

describe('div', () => {
  test('simple', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement('div');
    const { container } = render(<Div trackClick>Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick' })
    );
  });

  test('with id', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement('div');
    const { container } = render(<Div trackClick="my-event">Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'my-event' })
    );
  });

  test('with callback', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement('div');
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
    const Div = trackElement('div');
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
    const Div = trackElement('div', { alwaysTrack: ['onClick'] });
    const { container } = render(<Div>Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick' })
    );
  });

  test('passed false', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement('div', { alwaysTrack: ['onClick'] });
    const { container } = render(<Div trackClick={false}>Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).not.toHaveBeenCalled();
  });

  test('with id', () => {
    const spy = jest.fn();
    const trackElement = createTracker(spy);
    const Div = trackElement('div', { alwaysTrack: ['onClick'] });
    const { container } = render(<Div trackClick="my-event">Test</Div>);
    (container.firstElementChild as HTMLDivElement)?.click();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ eventName: 'onClick', info: 'my-event' })
    );
  });
});
