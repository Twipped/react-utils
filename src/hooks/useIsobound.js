/* eslint react/prop-types: 0 */
import { useRef, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import useEventCallback from './useEventCallback';
import useGettableState from './useGettableState';

const Context = createContext();
Context.displayName = 'IsoboundContext';

export function useIsoboundContext () {
  return useContext(Context);
}

export function IsoboundContextProvider ({ children }) {

  const [ panels, setPanels, getPanels ] = useGettableState([]);

  const attach  = useCallback((Panel, dataFn) => {
    setPanels([ ...getPanels(), { Panel, dataFn } ]);
  }, [ getPanels, setPanels ]);

  const detatch = useCallback((isoWrap) => {
    setPanels(getPanels().filter(({ Panel }) => Panel !== isoWrap));
  }, [ getPanels, setPanels ]);

  const context = {
    manager: { attach, detatch },
    panels,
    length: panels.length,
  };

  return <Context.Provider value={context}>{children}</Context.Provider>;
}


export default function useIsobound (body, data, displayName) {
  const triggerRef = useRef();
  const bodyRef = useRef(body);
  const updateNeeded = useRef(false);

  if (bodyRef !== body) {
    bodyRef.current = body;
    updateNeeded.current = true;
  }

  useEffect(() => {
    if (!updateNeeded.current) return;
    triggerRef.current?.();
    updateNeeded.current = false;
  }, [ body ]);

  const Wrapper = useCallback(() => {
    const [ , dispatch ] = useReducer((state) => !state, false);
    triggerRef.current = dispatch;
    return bodyRef.current;
  });

  if (displayName) Wrapper.displayName = displayName;

  // using event callback so that it updates with data changes
  const dataFn = useEventCallback(
    typeof data === 'function'
      ? data
      : () => data,
  );

  const { manager } = useIsoboundContext() || {};
  useEffect(() => {
    if (!manager) return;
    manager.attach(Wrapper, dataFn);
    return () => manager.detatch(Wrapper);
  }, []);

  return Wrapper;
}


export function IsoboundOutput ({ children: Render }) {
  const { panels, length } = useIsoboundContext();
  if (!length) return null;

  if (typeof Render === 'function') {
    return <Render panels={panels.map(({ Panel, dataFn }) => [ Panel, dataFn() ])} />;
  }

  return panels.map(({ Panel }, i) => (
    <Panel key={i} />
  ));
}

