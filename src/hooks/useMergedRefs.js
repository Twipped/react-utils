import { useMemo } from 'react';
import { noop } from 'common/utils';

function toFnRef (ref) {
  if (typeof ref === 'function') return ref;
  if (ref && 'current' in ref) return (value) => { ref.current = value; };
  return noop;
}

export function mergeRefs (...refs) {
  refs = refs.map(toFnRef);
  return (value) => {
    for (const r of refs) r(value);
  };
}

/**
 * Create and returns a single callback ref composed from two other Refs.
 *
 * ```tsx
 * const Button = React.forwardRef((props, ref) => {
 *   const [element, attachRef] = useCallbackRef<HTMLButtonElement>();
 *   const mergedRef = useMergedRefs(ref, attachRef);
 *
 *   return <button ref={mergedRef} {...props}/>
 * })
 * ```
 *
 * @param refA A Callback or mutable Ref
 * @param refB A Callback or mutable Ref
 * @category refs
 */
export default function useMergedRefs (...refs) {
  return useMemo(() => mergeRefs(...refs), refs);
}