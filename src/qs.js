
import { isUndefinedOrNull, isArray, isSet, entries } from 'common/utils';

export function stringify (obj) {
  const q = new URLSearchParams();
  for (const [ key, value ] of entries(obj)) {
    if (isUndefinedOrNull(value)) continue;
    if (isArray(value) || isSet(value)) {
      for (const v of value) {
        q.append(key, v);
      }
    } else {
      q.append(key, value);
    }
  }

  return q.toString();
}

export function parse (str) {
  const q = new URLSearchParams(str);
  const r = {};
  for (const [ key, value ] of q.entries()) {
    if (key in r) {
      if (isArray(r[key])) {
        r[key].push(value);
      } else {
        r[key] = [ r[key], value ];
      }
    } else {
      r[key] = value;
    }
  }

  return r;
}

export default {
  stringify,
  parse,
};
