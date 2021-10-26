/* global global */

import { isObject, assert, warning } from 'common/utils';
import qs from 'qs';

const localFetch = ((typeof window !== 'undefined' && window) || (typeof global !== 'undefined' && global)).fetch;

const CONTENT_TYPE = {
  form: 'application/x-www-form-urlencoded',
  json: 'application/json',
};

const BODY = {
  form: (d) => qs.stringify(d),
  json: JSON.stringify,
};

export default async function ajax (url, { data, type = 'form', method = 'GET', ...options } = {}) {
  assert(typeof localFetch === 'function', 'Fetch is missing from the current environment.');
  assert([ 'form', 'json' ].includes(type), `Type "${type}" is not recognized.`);

  method = String(method).toUpperCase();

  const contentType = CONTENT_TYPE[type];
  let body;

  if (method === 'GET' && isObject(data, true)) {
    const u = new URL(url, document.location);
    const existing = qs.parse(u.search);
    u.search = qs.stringify({
      ...existing,
      ...data,
    });
    url = u.toString();
  } else if (method === 'POST' && isObject(data, true)) {
    body = BODY[type](data);
  } else if (typeof data === 'string') {
    body = data;
  }

  options = {
    ...options,
    method, // *GET, POST, PUT, DELETE, etc.
    mode: 'same-origin', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Accept': 'application/json',
      'Content-Type': contentType,
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'same-origin', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body,
  };

  const res = await localFetch(url, options);

  if (res.ok) {

    const ctype = res.headers.get("Content-Type").split(/;\s+/);

    warning(
      ctype.includes('application/json'),
      'Server responded with non-json content-type',
      ctype,
    );

    const rbody = await res.text();

    assert(rbody, 'Server response was empty. PHP error?');

    try {
      return JSON.parse(rbody);
    } catch (err) {
      throw new Error('Could not parse response: ' + err.message);
    }
  }

  if (res.status === 404 || res.status === 410) return null;

  throw new Error(`Server responded ${res.status}: ${res.statusText}`);
}
