
import useForceUpdate from './useForceUpdate';
import { useRef, useCallback } from 'react';

export default function useRefWithUpdate () {
  const forceUpdate = useForceUpdate();
  const ref = useRef(null);
  const attachRef = useCallback((element) => {
    ref.current = element;
    // ensure that a menu set triggers an update for consumers
    forceUpdate();
  }, [ forceUpdate ]);
  return [ ref, attachRef ];
}
