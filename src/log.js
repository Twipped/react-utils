/* eslint no-console: 0 */

import { mapReduce } from 'common/utils';

const log = mapReduce([ 'info', 'error', 'warn', 'trace' ], (f) =>
  [ f, (...args) => {
    if (__ENV_PROD__) return;
    console[f](...args);
  } ],
);

export default log;
