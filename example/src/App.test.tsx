import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// @testing-library/react is weird about many things updating and fails too early.

test('tracks 1', async () => {
  const log = jest.spyOn(console, 'log');
  const { getAllByText } = render(<App />);
  const div = getAllByText('Click me')[0];
  div.click();
  expect(log.mock.calls.pop()![0]).toContain('1');
});

test('tracks 2', async () => {
  const log = jest.spyOn(console, 'log');
  const { getAllByText } = render(<App />);
  const div = getAllByText('Click me')[1];
  div.click();
  expect(log.mock.calls.pop()![0]).toContain('2');
  expect(log).toHaveBeenCalledWith({ i: { custom: 'here' } });
});

test('tracks 3', async () => {
  const log = jest.spyOn(console, 'log');
  const { container } = render(<App />);
  const slider = container.querySelectorAll('.MuiSlider-root')[0];
  (slider as any).click();
  expect(log.mock.calls.pop()![0]).toContain('3');
});

test('tracks 4', async () => {
  const log = jest.spyOn(console, 'log');
  const { container } = render(<App />);
  const slider = container.querySelectorAll('.MuiSlider-root')[1];
  (slider as any).click();
  expect(log.mock.calls.pop()![0]).toContain('4');
});
