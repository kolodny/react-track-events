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

type OtherCallbacks<T> = Exclude<
  {
    [K in keyof T]: K extends string
      ? T[K] extends Function
        ? K extends `on${Capitalize<string>}`
          ? never
          : K
        : never
      : never;
  }[keyof T],
  never
>;

type Trackable<T> = T & {
  [K in OnEvents<Required<T>> as `track${K}`]?:
    | boolean
    | Record<string, any>
    | string
    | ((
        ...arg: T extends Record<string, any>
          ? NonNullable<T[`on${K}`]> extends (...args: infer A) => any
            ? A
            : any
          : any
      ) => any);
} & {
  [K in OtherCallbacks<Required<T>> as `track_${K}`]?:
    | boolean
    | Record<string, any>
    | string
    | ((
        ...arg: T extends Record<string, any>
          ? NonNullable<T[K]> extends (...args: infer A) => any
            ? A
            : T[Capitalize<K>] extends (...args: infer A) => any
            ? A
            : any
          : any
      ) => any);
};

interface TrackEvent {
  eventName: string;
  args: any[];
  ComponentType: React.ComponentType | keyof JSX.IntrinsicElements;
  info?: any;
  returnValue?: any;
  thisContext?: any;
}

type Ref<T> = T extends React.DetailedHTMLProps<infer U, any>
  ? U extends React.HTMLAttributes<infer V>
    ? V
    : never
  : never;

type TrackedIntrinsicElement<T extends keyof JSX.IntrinsicElements> =
  React.ComponentType<
    Trackable<JSX.IntrinsicElements[T]> & {
      ref?: React.LegacyRef<Ref<JSX.IntrinsicElements[T]>>;
    }
  >;

export const createTracker = (onTrack: (event: TrackEvent) => void) => {
  return trackElement;

  function trackElement<T extends React.FunctionComponent<any>>(
    Component: T
  ): TrackedElement<T>;
  function trackElement<T extends keyof JSX.IntrinsicElements>(
    tag: T
  ): TrackedIntrinsicElement<T>;
  function trackElement<T extends React.FunctionComponent<any>>(
    Component: T | keyof JSX.IntrinsicElements
  ) {
    const inner = ((props: any) => {
      const wrapped = { ...props };
      for (const key of Object.keys(props ?? {})) {
        if (/^track[_A-Z]/.test(key)) {
          const value = wrapped[key];
          delete wrapped[key];
          // track_ prefix is for raw non onSomething callbacks, otherwise we need to know casing beforehand.
          const eventName = key[5] === '_' ? key.slice(6) : `on${key.slice(5)}`;
          const original = wrapped[eventName];
          wrapped[eventName] = function (...args: any[]) {
            let info = value;
            if (typeof info === 'function') {
              info = info.apply(this, arguments);
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
            if (info !== undefined && info !== true) trackEvent.info = info;
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
