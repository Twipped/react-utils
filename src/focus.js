
import PropTypes from 'prop-types';
import { Children, createContext, useContext, forwardRef, useRef, useEffect, useCallback, cloneElement } from 'react';
import { isFunction, isUndefinedOrNull } from '@twipped/utils';
import { useEventHandlerOn } from './hooks/useEventHandler';
import { useDefer } from './hooks/useTimers';
import useComputedRef from './hooks/useComputedRef';
import useGettableState from './hooks/useGettableState';
import useMemoObject from './hooks/useMemoObject';
import useSilentState from './hooks/useSilentState';
import { useToggledGlobalListener } from './hooks/useGlobalListener';

function randomId () {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16).replace(/[^a-zA-Z0-9]/g, '').substr(-8);
}

export const FocusContext = createContext(null);
FocusContext.displayName = 'FocusContext';

export function useFocusContext () {
  return useContext(FocusContext);
}

function assignRef (ref, value) {
  if (isFunction(ref)) ref(value);
  if (ref && 'current' in ref) ref.current = value;
}

function scanTargets (targets, target) {
  for (const ref of targets.keys()) {
    if (ref.current && target === ref.current || ref.current.contains(target)) {
      return ref;
    }
  }
  return null;
}

export const FocusProvider = forwardRef(({
  as: Component,
  onChange,
  children,
  focusKey,
  preserve,
  ...props
}, parentRef) => {
  const { ref: focusRef, key: rootFocusKey } = useFocus(focusKey, true);

  const targetRef = focusRef || useRef();
  const defer = useDefer();
  const { current: targets } = useComputedRef(() => new Map);
  const [ focusTarget, setFocus, getFocus ] = useGettableState(false);


  const [ , setMouseDown, getMouseDown ] = useSilentState(false);

  const docMouseEnd = useToggledGlobalListener('mouseup', () => {
    const focusedTarget = getFocus();
    if (preserve && focusedTarget) focusedTarget.focus();
    setMouseDown(false);
    docMouseEnd.remove();
  });

  useEventHandlerOn(targetRef, 'mousedown', () => {
    setMouseDown(true);
    docMouseEnd.attach();
  }, true);

  useEventHandlerOn(targetRef, 'focus', (ev) => {
    defer.clear();
    const currentFocus = getFocus();

    const newFocus = scanTargets(targets, ev.target);

    if (!currentFocus && !newFocus) {
      onChange && onChange(null, ev.target);
    } else if (currentFocus !== newFocus) {
      setFocus(newFocus);
      onChange && onChange(newFocus && targets.get(newFocus)?.current[0], ev.target);
    }
  }, true);

  useEventHandlerOn(targetRef, 'blur', (ev) => {
    const currentFocus = getFocus();
    if (!currentFocus) return;
    const { relatedTarget } = ev;

    if (targetRef.current && targetRef.current.contains(relatedTarget)) {
      // focus moved from child to child
      const newFocus = scanTargets(targets, relatedTarget);

      if (currentFocus !== newFocus) {
        setFocus(newFocus);
        onChange && onChange(newFocus && targets.get(newFocus)?.current[0], relatedTarget);
      }

    } else if (preserve && getMouseDown() && currentFocus && currentFocus.current) {
      currentFocus.current.focus();
    } else {
      defer.set(() => {
        if (getFocus()) {
          setFocus(null);
          onChange && onChange();
        }
      });
    }
  }, true);

  const context = useMemoObject({
    bind: useCallback((ref, focusKeyRef) => {
      targets.set(ref, focusKeyRef);
    }, [ targets ]),
    unbind: useCallback((ref) => {
      targets.delete(ref);
    }),
    setFocus,
    getFocus,
    focused: !!focusTarget,
    rootFocusKey,
    focusTarget: focusTarget?.current,
    activeFocus: focusTarget ? focusTarget && targets.get(focusTarget)?.current[0] : false,
    onChange,
  });


  if (Component) {
    const ref = useCallback((node) => {
      assignRef(parentRef, node);
      assignRef(targetRef, node);
    }, [ parentRef, targetRef ]);

    return (
      <FocusContext.Provider value={context}><Component ref={ref} {...props}>{children}</Component></FocusContext.Provider>
    );
  }

  const child = Children.only(children);
  const childRef = child.ref;

  const newChild = cloneElement(child, {
    ref: useCallback((node) => {
      assignRef(parentRef, node);
      assignRef(childRef, node);
      assignRef(targetRef, node);
    }, [ parentRef, childRef, targetRef ]),
    ...props,
  });

  return (
    <FocusContext.Provider value={context}>{newChild}</FocusContext.Provider>
  );
});
FocusProvider.propTypes = {
  as: PropTypes.elementType,
  onChange: PropTypes.func,
  focusKey: PropTypes.any,
  preserve: PropTypes.bool,
};

export default function useFocus (focusKey, noLocal) {
  const context = useFocusContext();

  if (!context && noLocal) return { ref: null };

  const ref = useRef();
  const keyRef = useRef([ null, focusKey ]);
  if (isUndefinedOrNull(keyRef.current[0]) || keyRef.current[1] !== focusKey) {
    keyRef.current[0] = focusKey || randomId();
  }

  if (context) {
    useEffect(() => {
      context.bind(ref, keyRef);
      return () => context.unbind(ref);
    }, [ keyRef.current[0] ]);

    return {
      ref,
      key: keyRef.current[0],
      focused: context.activeFocus === keyRef.current[0],
      focusTarget: context.focusTarget,
    };
  }

  const [ focusTarget ] = useLocalFocus(ref);

  return {
    ref,
    focused: !!focusTarget,
    focusTarget,
  };

}

export function useLocalFocus (targetRef) {
  const defer = useDefer();
  const [ focusTarget, setFocus, getFocus ] = useGettableState(false);

  useEventHandlerOn(targetRef, 'focus', (ev) => {
    defer.clear();
    if (getFocus() !== ev.target) setFocus(ev.target);
  });

  useEventHandlerOn(targetRef, 'blur', (ev) => {
    const focusedTarget = getFocus();
    if (!focusedTarget) return;
    if (targetRef.current && targetRef.current.contains(ev.relatedTarget)) {
      // focus moved from child to child
      if (focusedTarget !== ev.relatedTarget) setFocus(ev.relatedTarget);
    } else {
      defer.set(() => {
        if (getFocus()) {
          setFocus(null);
        }
      });
    }
  });

  return [ focusTarget, getFocus ];
}

