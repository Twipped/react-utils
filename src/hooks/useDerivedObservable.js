
import { computed } from 'mobx';
import { useRef } from 'react';
import dft from './default';
import { shallowEqual, deepEqual } from 'common/utils';
import areHookInputsEqual from './areHookInputsEqual';

export default function useDerivedObservable (fn, deps, comparison = areHookInputsEqual) {
  if (comparison === false) comparison = shallowEqual;
  if (comparison === true) comparison = deepEqual;

  const depsRef = useRef(dft);
  const computedRef = useRef(dft);
  // fn = useEventCallback(fn);

  if (computedRef.current === dft) {
    computedRef.current = computed(fn);
  }
  const c = computedRef.current;

  c.derivation = fn;

  if (depsRef.current === dft) {
    depsRef.current = deps;
  } else if (c.dependenciesState_ === 0 && !comparison(depsRef.current, deps)) {
    depsRef.current = deps;

    // invalidate the computed
    c.dependenciesState_ = 2;
  }

  return c;
}
