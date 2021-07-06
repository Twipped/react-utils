
import { useCallback } from 'react';
import useGettableState from './useGettableState';

/**
 * Produces a state hook that can only hold a boolean value.
 * Invoking the setter without a value toggles it.
 * @param  {Boolean} initial
 */
export default function useToggledState (initial = false) {
  const [ state, setter, getter ] = useGettableState(!!initial);

  const toggle = useCallback((onoff) => {
    if (onoff !== true && onoff !== false) onoff = !getter();
    setter(onoff);
    return onoff;
  });

  return [ state, toggle, getter ];
}
