/* eslint react/prop-types: 0 */
import { useRef, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import { EventEmitter } from '@twipped/utils';

const Context = createContext();
Context.displayName = 'BoundUpdateContext';

export function useBoundUpdateContext () {
  return useContext(Context);
}

export function UpdateBindingProvider ({ channelName, children }) {
  const parent = useBoundUpdateContext();

  // unless overridden, create a new channel for each layer
  const channelSymbol = useRef(channelName || Symbol('default channel'));

  // but always use the root emitter. This allows bindings to cross deep trees.
  const bindings = parent?.bindings || useRef();
  if (!bindings.current) bindings.current = new EventEmitter;

  const attach  = useCallback((hook, chan = channelSymbol.current) => {
    bindings.current.on(chan, hook);
  }, [ bindings ]);

  const detatch = useCallback((hook) => {
    bindings.current.off(hook);
  }, [ bindings ]);

  const trigger = useCallback((chan = channelSymbol.current) => {
    bindings.current.emit(chan);
  });

  const context = {
    _bindings: bindings,
    _defaultChannel: channelSymbol.current,
    manager: { attach, detatch },
    length: bindings.length,
    trigger,
  };

  return <Context.Provider value={context}>{children}</Context.Provider>;
}


export function bindForUpdates (channelName) {
  const { manager, _defaultChannel } = useBoundUpdateContext() || {};

  // this reducer will force the component to update when dispatch is invoked.
  const [ flip, dispatch ] = useReducer((state) => (state + 1) % 100, 0);

  useEffect(() => {
    if (!manager) return;
    manager.attach(dispatch, channelName || _defaultChannel);
    return () => manager.detatch(dispatch);
  }, []);

  return flip;
}

export function updateBindWrapper (component, channelName) {
  const Wrapper = (props) => {
    bindForUpdates(channelName);
    return component(props);
  };
  Wrapper.displayName = (component.displayName || component.name) + '.UpdateBinding';
  return Wrapper;
}

export function useBoundUpdate () {
  const { trigger } = useContext(Context) || {};
  if (!trigger) throw new Error('useBoundUpdate invoked outside of an UpdateBindingContext');
  return trigger;
}
