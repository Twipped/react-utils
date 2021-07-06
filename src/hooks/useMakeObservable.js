
import { observable } from 'mobx';
import useImmediateUpdateEffect from './useImmediateUpdateEffect';
import { useState } from 'react';

export default function useMakeObservable (input) {

  var [ state, writeState ] = useState(() => observable(input));
  useImmediateUpdateEffect(() => {
    writeState(observable(input));
  }, [ input ]);

  return state;

}
