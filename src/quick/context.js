
/* eslint react/prop-types:0 */
import { createContext, useContext, useRef, useCallback } from 'react';

export default function quickContext (name, derivationFn, { inherit = false } = {}) {
  const Context = createContext();
  Context.displayName = name;

  function useQuickContext () {
    return useContext(Context);
  }

  function Provider ({ children, ...props }) {
    if (inherit && useContext(Context)) return children;

    const context = derivationFn ? derivationFn(props) : props;

    return <Context.Provider value={context}>{children}</Context.Provider>;
  }

  Provider.displayName = name + 'Provider';

  return [ useQuickContext, Provider, Context ];
}


export function useLocalContext (displayName) {
  const ref = useRef();
  if (!ref.current) {
    ref.current = createContext();
    ref.current.displayName = displayName;
  }

  const use = useCallback(() => useContext(ref.current));

  return [ ref.current.Provider, use ];
}
