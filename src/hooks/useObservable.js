
import { observe } from 'mobx';
import { useEffect } from 'react';
import useWillMount from './useWillMount';
import useForceUpdate from './useForceUpdate';

/**
 * Observes the passed mobx observable and triggers an update if it changes.
 * @param  {Function} fn
 */
export default function useObservable (o) {

  const update = useForceUpdate();
  const dispose = useWillMount(() => observe(o, update));

  // dispose the reaction on unmount.
  useEffect(() => dispose, []);
}
