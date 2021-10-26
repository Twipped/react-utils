
import { useCallback } from 'react';

import KEYS from 'common/keyboard';


export function useQuickKey (key, fn, props) {
  key = [ key ].flat(Infinity);
  return useCallback((ev) => {
    if (key.includes(ev.key)) fn(ev);
  }, props);
}

Object.assign(useQuickKey, KEYS);

