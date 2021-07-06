
import { useState } from 'react';
import { cloneChildren } from 'common/children';

/**
 * Create a single useState hook and distributes it as properties to all of the underlying child elements.
 * @param {String} options.valueKey  The property key to use for the state value (default is 'value')
 * @param {String} options.updateKey The property key to use for the state update function (default is onChange). Accepts a single argument.
 * @param {mixed} options.initial    The default value to initialize the state as.
 * @param {function} options.permutate An intermediate function to process the onChange result before invoking setState.
 */
export default function QuickState ({
  valueKey = 'value',
  updateKey = 'onChange',
  initial,
  permutate = null,
  onChange,
  children,
}) {
  const [ state, setState ] = useState(initial);
  function handleChange (...args) {
    if (permutate) {
      const res = permutate(...args);
      setState(res);
      if (onChange) onChange(res);
      return;
    }

    setState(...args);
    if (onChange) onChange(...args);
  }
  const props = {
    [valueKey]: state,
    [updateKey]: handleChange,
  };

  return cloneChildren(children, () => props);
}
