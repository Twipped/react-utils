import PropTypes from 'prop-types';
import { useRef, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import useUpdatedRef from './hooks/useUpdatedRef';
import { UpdateBindingProvider, bindForUpdates, useBoundUpdate } from './update-binding';

const IsoboundContext = createContext();
IsoboundContext.displayName = 'IsoboundContext';

export function useIsoboundContext () {
  return useContext(IsoboundContext);
}

export function IsoboundProvider ({ children }) {

  const [ flip, update ] = useReducer((state) => (state + 1) % 100, 0);

  const bindingsRef = useRef();
  if (!bindingsRef.current) bindingsRef.current = new Map();
  const bindings = bindingsRef.current;

  const attach  = useCallback((bindKey, binding) => {
    bindings.set(bindKey, binding);
    update();
  });

  const detatch = useCallback((bindKey) => {
    bindings.delete(bindKey);
    update();
  });

  const context = {
    manager: { attach, detatch },
    bindings: Array.from(bindings.values()),
    length: bindings.size,
    flip,
  };

  return (
    <UpdateBindingProvider>
      <IsoboundContext.Provider value={context}>
        {children}
      </IsoboundContext.Provider>
    </UpdateBindingProvider>
  );
}


export default function useIsobound (body, data, displayName) {
  const bindingKeyRef = useRef();
  if (!bindingKeyRef.current) bindingKeyRef.current = Symbol('Isobinding' + (displayName ? '.' + displayName : ''));
  const bindingKey = bindingKeyRef.current;

  const bodyRef = useUpdatedRef(body);
  const dataRef = useUpdatedRef(data);

  const update = useBoundUpdate();

  const BodyWrapper = useCallback(() => {
    bindForUpdates(bindingKey);
    return bodyRef.current;
  });
  BodyWrapper.displayName = (displayName ? displayName + '.BodyBinding' : 'IsoboundBodyWrapper');

  const DataWrapper = useCallback(({ children }) => {
    bindForUpdates(bindingKey);
    if (typeof children !== 'function') return null;
    return children(dataRef.current);
  });
  DataWrapper.displayName = (displayName ? displayName + '.DataBinding' : 'IsoboundDataWrapper');
  DataWrapper.propTypes = { children: PropTypes.func.isRequired };

  useEffect(() => { update(bindingKey); });

  const dataFn = useCallback(() => dataRef.current);

  const { manager } = useIsoboundContext() || {};
  useEffect(() => {
    if (!manager) return;
    manager.attach(bindingKey, {
      key: bindingKey,
      BodyWrapper,
      DataWrapper,
      dataFn,
    });
    return () => manager.detatch(bindingKey);
  }, []);

  return BodyWrapper;
}


export function IsoboundOutput ({ children }) {
  const { bindings, length } = useIsoboundContext();
  if (!length) return null;

  if (typeof children === 'function') {
    return bindings.map(({ DataWrapper }, i) => (
      <DataWrapper key={i}>{children}</DataWrapper>
    ));
  }

  return bindings.map(({ BodyWrapper }, i) => (
    <BodyWrapper key={i} />
  ));
}

