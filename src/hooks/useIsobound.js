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
  // const isoPanels = useMap();

  const [ panelSet, setPanels, getPanels ] = useGettableState([]);

  const attach  = useCallback((isoWrap, data) => { setPanels([ ...getPanels(), [ isoWrap, data ] ]); }, [ getPanels, setPanels ]);
  const detatch = useCallback((isoWrap)       => {
    setPanels(getPanels().filter(([ wrapper ]) => wrapper !== isoWrap));
  }, [ getPanels, setPanels ]);

  const panels = panelSet.map(([ iso, dataFn ]) =>
    [ iso, typeof dataFn === 'function' ? dataFn() : dataFn ],
  );

  const context = {
    manager: { attach, detatch },
    panels,
    length: panelSet.length,
  };

  return <Context.Provider value={context}>{children}</Context.Provider>;
}


export default function useIsobound (body, data, displayName) {
  const triggerRef = useRef();
  const bodyRef = useRef(body);

  useEffect(() => {
    if (body === bodyRef.current) return;
    bodyRef.current = body;
    triggerRef.current?.();
  });

  const Wrapper = useEventCallback(() => {
    const [ , dispatch ] = useReducer((state) => !state, false);
    triggerRef.current = dispatch;
    return bodyRef.current;
  });

  if (displayName) Wrapper.displayName = displayName;

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


export function IsoboundOutput ({ children: render }) {
  const { panels, length } = useIsoboundContext();
  if (!length) return null;
  return panels.map(([ IsoPanel, props ], i) => (
    typeof render === 'function'
      ? render(IsoPanel, props, i)
      : <IsoPanel key={i} />
  ));
}
