import React from 'react';

import { tags } from './tags';

type TrackedElement<
  Element extends React.ComponentType,
  Info extends InfoType,
  RequiredEvents extends string
> = Element extends React.FunctionComponent<infer Props>
  ? React.FunctionComponent<Trackable<Props, Info, RequiredEvents>>
  : Element extends React.ComponentClass<infer Props>
  ? React.ComponentClass<Trackable<Props, Info, RequiredEvents>>
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

type Args<Props, Key extends string> = Props extends Record<string, any>
  ? NonNullable<Props[Key]> extends (...args: infer A) => any
    ? A
    : Props[Key] extends (...args: infer A) => any
    ? A
    : any
  : any;

type EventNameToAttribute<T extends string> = T extends `on${infer Event}`
  ? Event extends Capitalize<Event>
    ? `track${Event}`
    : `track_${T}`
  : `track_${T}`;

type Trackable<
  Props,
  Info extends InfoType,
  RequiredEvents extends string
> = Props & {
  [K in OnEvents<Required<Props>> as `track${K}`]?:
    | false
    | Info
    | ((...arg: Args<Props, `on${K}`>) => Info);
} & {
  [K in OtherCallbacks<Required<Props>> as `track_${K}`]?:
    | false
    | Info
    | ((...arg: Args<Props, K>) => Info);
} & (Info extends undefined
    ? {}
    : {
        [K in RequiredEvents as EventNameToAttribute<K>]:
          | false
          | Info
          | ((...arg: Args<Props, K>) => Info);
      });

interface TrackEvent<Info extends InfoType, Breadcrumb> {
  eventName: string;
  args: any[];
  ComponentType: React.ComponentType | keyof JSX.IntrinsicElements;
  info: Info;
  breadcrumbs: Breadcrumb[];
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
  Info extends InfoType,
  RequiredEvents extends string
> = React.ComponentType<
  Trackable<JSX.IntrinsicElements[T], Info, RequiredEvents> & {
    ref?: React.LegacyRef<Ref<JSX.IntrinsicElements[T]>>;
  }
>;

interface Options<RequiredEvents extends string> {
  /**
   * Always track.
   *   IE passing ['onClick'] tracks click events without needing to pass trackClick attribute.
   */
  alwaysTrack?: RequiredEvents[];
}

type RequiredEventsKeys<T extends React.ComponentType> =
  T extends React.ComponentType<infer Props>
    ? {
        [K in keyof Props]: NonNullable<Props[K]> extends Function ? K : never;
      }[keyof Props]
    : never;

type InfoType = number | string | any[] | {} | undefined;

const attributeToEventName = (attribute: string) =>
  attribute[5] === '_' ? attribute.slice(6) : `on${attribute.slice(5)}`;
const eventNameToAttribute = (eventName: string) =>
  /^on[A-Z]/.test(eventName)
    ? `track${eventName.slice(2)}`
    : `track_${eventName}`;

export const createTracker = <Info extends InfoType, Breadcrumb = any>(
  onTrack: (event: TrackEvent<Info, Breadcrumb>) => void
) => {
  (trackElement as any).intrinsicElements = {};
  for (const tag of tags) {
    (trackElement as any).intrinsicElements[tag] = trackElement(tag as any);
  }
  (trackElement as any).withOptions = (options: any) => {
    const elements: any = {};
    for (const tag of tags) {
      elements[tag] = trackElement(tag as any, options);
    }
    return elements;
  };
  (trackElement as any).trackIntrinsicElement = (tag: any, options: any) => {
    return trackElement(tag as any, options);
  };

  const BreadcrumbContext = React.createContext<any[]>([]);
  const BreadcrumbProvider = (props: {
    children: React.ReactNode;
    crumb: Breadcrumb;
  }) => {
    const crumbs = React.useContext(BreadcrumbContext);
    return (
      <BreadcrumbContext.Provider value={[...crumbs, props.crumb]}>
        {props.children}
      </BreadcrumbContext.Provider>
    );
  };

  (trackElement as any).Breadcrumb = BreadcrumbProvider;

  return trackElement as typeof trackElement & {
    intrinsicElements: {
      [K in keyof JSX.IntrinsicElements]: TrackedIntrinsicElement<
        K,
        Info,
        never
      >;
    };
    Breadcrumb: typeof BreadcrumbProvider;
    withOptions: <
      RequiredEvents extends keyof JSX.IntrinsicElements[keyof JSX.IntrinsicElements] &
        `on${string}` = never
    >(
      options?: Options<RequiredEvents>
    ) => {
      [K in keyof JSX.IntrinsicElements]: TrackedIntrinsicElement<
        K,
        Info,
        RequiredEvents
      >;
    };
    trackIntrinsicElement: <
      Tag extends keyof JSX.IntrinsicElements,
      RequiredEvents extends keyof JSX.IntrinsicElements[Tag] &
        `on${string}` = never
    >(
      tags: Tag,
      options?: Options<RequiredEvents>
    ) => TrackedIntrinsicElement<Tag, Info, RequiredEvents>;
  };

  function trackElement<
    Element extends React.ComponentType<any>,
    RequiredEvents extends RequiredEventsKeys<Element> = never
  >(
    Component: Element,
    options?: Options<RequiredEvents>
  ): TrackedElement<Element, Info, RequiredEvents> {
    let alwaysTrackAttributes: Record<string, true> | undefined = undefined;
    if (options?.alwaysTrack) {
      alwaysTrackAttributes = {};
      for (const eventName of options.alwaysTrack) {
        const attribute = eventNameToAttribute(eventName);
        alwaysTrackAttributes[attribute] = true;
      }
    }

    const inner = ((props: any) => {
      const breadcrumbs = React.useContext(BreadcrumbContext);
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
            const trackEvent: TrackEvent<Info, Breadcrumb> = {
              eventName,
              ComponentType: Component,
              args,
              breadcrumbs,
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
    }) as TrackedElement<Element, Info, RequiredEvents>;

    return React.forwardRef((props, ref) => {
      return (inner as any)({ ...props, ref });
    }) as any;
  }
};
