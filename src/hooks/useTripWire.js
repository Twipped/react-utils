
import { useRef } from 'react';

/**
 * Creates a `Ref` which initializes as false and remains false until a truthy
 * value is provided on the hook. The value will then always be true for the
 * life of the component.
 *
 * @param value The `Ref` value
 */
export default function useTripWire (value) {
  const ref = useRef(false);
  ref.current = !!ref.current || !!value;
  return ref.current;
}
