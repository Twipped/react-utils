
import { useRef } from 'react';
import usePrevious from './usePrevious';

export default function useIncrementer (value, step = 1) {
  const ref = useRef(-step);
  const prev = usePrevious(value);

  if (value !== prev) {
    ref.current += step;
  }

  return ref.current;
}
