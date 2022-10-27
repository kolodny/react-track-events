import React from 'react';

type TrackedElement<
  Element extends React.ComponentType,
  Info extends InfoType
> = Element extends React.FunctionComponent<infer Props>
  ? React.FunctionComponent<Trackable<Props, Info>>
  : Element extends React.ComponentClass<infer Props>
  ? React.ComponentClass<Trackable<Props, Info>>
  : never;

type OnEvents<Props> = Exclude<
  {
    [K in keyof Props]: K extends `on${Capitalize<string>}`
      ? Props[K] extends Function
        ? K extends `on${infer E}`
          ? E
          : never
        : never
      : never;
  }[keyof Props],
  never
>;

type OtherCallbacks<Props> = Exclude<
  {
    [K in keyof Props]: K extends string
      ? Props[K] extends Function
        ? K extends `on${Capitalize<string>}`
          ? never
          : K
        : never
      : never;
  }[keyof Props],
  never
>;

type Trackable<Props, Info extends InfoType> = Props & {
  [K in OnEvents<Required<Props>> as `track${K}`]?:
    | Info
    | ((
        ...arg: Props extends Record<string, any>
          ? NonNullable<Props[`on${K}`]> extends (...args: infer A) => any
            ? A
            : any
          : any
      ) => Info);
} & {
  [K in OtherCallbacks<Required<Props>> as `track_${K}`]?:
    | Info
    | ((
        ...arg: Props extends Record<string, any>
          ? NonNullable<Props[K]> extends (...args: infer A) => any
            ? A
            : Props[Capitalize<K>] extends (...args: infer A) => any
            ? A
            : any
          : any
      ) => Info);
};

interface TrackEvent<Info extends InfoType> {
  eventName: string;
  args: any[];
  ComponentType: React.ComponentType | keyof JSX.IntrinsicElements;
  info: Info;
  returnValue?: any;
  thisContext?: any;
}

type Ref<T> = T extends React.DetailedHTMLProps<infer U, any>
  ? U extends React.HTMLAttributes<infer V>
    ? V
    : never
  : never;

type TrackedIntrinsicElement<
  T extends keyof JSX.IntrinsicElements,
  Info extends InfoType
> = React.ComponentType<
  Trackable<JSX.IntrinsicElements[T], Info> & {
    ref?: React.LegacyRef<Ref<JSX.IntrinsicElements[T]>>;
  }
>;

interface Options {
  /**
   * Always track.
   *   IE passing ['onClick'] tracks click events without needing to pass trackClick attribute.
   */
  alwaysTrack?: string[];
}

type InfoType = number | string | any[] | {} | undefined;

const attributeToEventName = (attribute: string) =>
  attribute[5] === '_' ? attribute.slice(6) : `on${attribute.slice(5)}`;
const eventNameToAttribute = (eventName: string) =>
  /^on[A-Z]/.test(eventName)
    ? `track${eventName.slice(2)}`
    : `track_${eventName}`;

export const createTracker = <Info extends InfoType>(
  onTrack: (event: TrackEvent<Info>) => void
) => {
  return trackElement;

  function trackElement<Element extends React.FunctionComponent<any>>(
    Component: Element,
    options?: Options
  ): TrackedElement<Element, Info>;
  function trackElement<Tag extends keyof JSX.IntrinsicElements>(
    tag: Tag,
    options?: Options
  ): TrackedIntrinsicElement<Tag, Info>;
  function trackElement<Element extends React.FunctionComponent<any>>(
    Component: Element | keyof JSX.IntrinsicElements,
    options?: Options
  ) {
    let alwaysTrackAttributes: Record<string, true> | undefined = undefined;
    if (options?.alwaysTrack) {
      alwaysTrackAttributes = {};
      for (const eventName of options.alwaysTrack) {
        const attribute = eventNameToAttribute(eventName);
        alwaysTrackAttributes[attribute] = true;
      }
    }

    const inner = ((props: any) => {
      const propsWithAlways = alwaysTrackAttributes
        ? { ...alwaysTrackAttributes, ...props }
        : props;

      const wrapped: any = {};
      for (const key of Object.keys(propsWithAlways)) {
        if (!/^track[_A-Z]/.test(key)) {
          // Just a regular prop that we need to copy
          wrapped[key] = props[key];
        } else {
          // A trackThing attribute
          if (props[key] === false) continue;
          const eventName = attributeToEventName(key);
          const original = wrapped[eventName];
          wrapped[eventName] = function (...args: any[]) {
            let info = props[key] as any;
            if (typeof info === 'function') {
              info = info.apply(this, arguments);
            }
            const returnValue = original?.apply(this, arguments);
            const trackEvent: TrackEvent<Info> = {
              eventName,
              ComponentType: Component,
              args,
            } as any;
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
    }) as TrackedElement<Element, Info>;

    return React.forwardRef((props, ref) => {
      return inner({ ...props, ref });
    }) as any;
  }
};
