
import { useCallback } from 'react';

// export { default as KEYS } from 'common/keyboardevent-keys';
import KEYS from 'common/keyboardevent-keys';


export function useQuickKey (key, fn, props) {
  key = [ key ].flat(Infinity);
  return useCallback((ev) => {
    if (key.includes(ev.key)) fn(ev);
  }, props);
}

Object.assign(useQuickKey, KEYS);

