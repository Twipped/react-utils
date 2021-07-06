
import { useRef } from 'react';
import dft from './default';

/**
 * Exactly the same as `useRef` except that the initial value is set via a
 * factory function. Useful when the default is relatively costly to construct.
 *
 * @param value The `Ref` value
 */
export default function useComputedRef (fn) {
  const ref = useRef(dft);
  if (ref.current === dft) ref.current = fn();
  return ref;
}
