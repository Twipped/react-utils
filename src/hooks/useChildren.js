
import { useRef } from 'react';
import areHookInputsEqual from './areHookInputsEqual';
import { mapChildren } from 'common/children';

export default function useChildren (children, factory) {
  let isValid = true;

  const deps = mapChildren(children, (c) => [ c.key, ...Object.values(c.props) ]).flat(1);

  const valueRef = useRef();

  if (valueRef.current) {
    isValid = !!(
      deps &&
      valueRef.current.deps &&
      areHookInputsEqual(deps, valueRef.current.deps)
    );
  } else {
    valueRef.current = {
      deps,
      result: factory(),
    };
  }

  const cache = isValid ? valueRef.current : { deps, result: factory() };
  // must update immediately so any sync renders here don't cause an infinite loop
  valueRef.current = cache;

  return cache.result;
}
