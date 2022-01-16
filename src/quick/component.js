import { forwardRef } from 'react';
import { cl as classNames, map, isFunction, isNotUndefinedOrNull, omit } from '@twipped/utils';
import PropTypes from 'prop-types';

export default function quickComponent (className, name, { as: As = 'div', propTypes, propClassMap, ...props } = {}) {
  const C = forwardRef(({ as: Component = As, ...p }, ref) => {
    const classes = [
      p.className,
      className,
      ...map(propClassMap, (v, pk) => isNotUndefinedOrNull(p[pk]) && propClassMapEval(v, p[pk])),
    ];
    if (propClassMap) p = omit(p, Object.keys(propClassMap));
    return (
      <Component
        {...props}
        {...p}
        ref={ref}
        className={classNames(classes)}
      />
    );
  });
  if (name) C.displayName = name;
  C.propTypes = {
    as: PropTypes.elementType,
    ...propTypes,
  };
  return C;
}

function propClassMapEval (className, value) {
  if (isFunction(className)) return className(value);
  if (value) return className;
  return null;
}
