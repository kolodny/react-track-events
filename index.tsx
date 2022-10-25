import React from 'react';

type TrackedElement<T extends React.ComponentType> =
  T extends React.FunctionComponent<infer Props>
    ? React.FunctionComponent<Trackable<Props>>
    : T extends React.ComponentClass<infer Props>
    ? React.ComponentClass<Trackable<Props>>
    : never;

type OnEvents<T> = Exclude<
  {
    [K in keyof T]: K extends `on${Capitalize<string>}`
      ? T[K] extends Function
        ? K extends `on${infer E}`
          ? E
          : never
        : never
      : never;
  }[keyof T],
  never
>;

type Trackable<T> = T & {
  // [K in keyof T]: K extends `on${Capitalize<string>}` ? K : never
  [K in OnEvents<Required<T>> as `track${K}`]?:
    | boolean
    | ((
        ...arg: T extends Record<string, any>
          ? NonNullable<T[`on${K}`]> extends (...args: infer A) => any
            ? A
            : any
          : any
      ) => any);
};

interface TrackEvent {
  eventName: string;
  args: any[];
  ComponentType: React.ComponentType | keyof JSX.IntrinsicElements;
  /** This will only be set when the Tracked component is passed a ref and it has a current value. */
  instance?: any;
  info?: any;
  returnValue?: any;
  thisContext?: any;
}

type Ref<T> = T extends React.DetailedHTMLProps<infer U, any>
  ? U extends React.HTMLAttributes<infer V>
    ? V
    : never
  : never;

export const createTracker = (onTrack: (event: TrackEvent) => void) => {
  return trackElement;

  function trackElement<T extends React.FunctionComponent<any>>(
    Component: T
  ): TrackedElement<T>;
  function trackElement<T extends keyof JSX.IntrinsicElements>(
    tag: T
  ): React.ComponentType<
    Omit<Trackable<JSX.IntrinsicElements[T]>, 'ref'> & {
      ref?: React.LegacyRef<Ref<JSX.IntrinsicElements[T]>>;
    }
  >;
  function trackElement<T extends React.FunctionComponent<any>>(
    Component: T | keyof JSX.IntrinsicElements
  ) {
    const inner = ((props: any) => {
      const wrapped = { ...props };
      for (const key of Object.keys(props ?? {})) {
        if (/^track[A-Z]/.test(key)) {
          const value = wrapped[key];
          delete wrapped[key];
          const eventName =
            key.indexOf('trackFunction') === 0
              ? key.slice(13)
              : `on${key.slice(5)}`;
          const original = wrapped[eventName];
          wrapped[eventName] = function (...args: any[]) {
            let info: any = undefined;
            if (typeof value === 'function') {
              info = value.apply(this, arguments);
            }
            const returnValue = original?.apply(this, arguments);
            const trackEvent: TrackEvent = {
              eventName,
              ComponentType: Component,
              args,
            };
            if (returnValue !== undefined) trackEvent.returnValue = returnValue;
            if (this !== undefined && this !== window)
              trackEvent.thisContext = this;
            if (info !== undefined) trackEvent.info = info;
            if (wrapped.ref?.current) trackEvent.instance = wrapped.ref.current;
            onTrack(trackEvent);
            return returnValue;
          };
        }
      }

      return React.createElement(Component, wrapped);
    }) as TrackedElement<T>;

    return React.forwardRef((props, ref) => {
      return inner({ ...props, ref });
    }) as any;
  }
};
