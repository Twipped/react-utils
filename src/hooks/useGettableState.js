
import { useState, useCallback, useRef } from 'react';
import { isObject } from 'common/utils';

/**
 * Functions identical to useState, except the state is retrievable
 * via a callback passed as the third return element. This always returns
 * the current state regardless of where we are in the render process.
 * @param  {...[type]} args [description]
 * @return {[type]}         [description]
 */
export default function useGettableState (initial, { alwaysUpdate } = {}) {
  const [ state, setState ] = useState(initial);
  const ref = useRef(state);
  ref.current = state;

  const getter = useCallback(() => ref.current, [ ref ]);
  const setter = useCallback((value, update = alwaysUpdate) => {
    if (update && isObject(value, true)) {
      value = { ...ref.current, ...value };
    }
    ref.current = value;
    setState(value);
  }, [ ref, setState ]);

  setter.reset = useCallback(() => setter(initial));

  return [ state, setter, getter ];
}
