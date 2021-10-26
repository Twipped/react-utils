
import PropTypes from 'prop-types';

PropTypes.refObject = PropTypes.shape({ current: PropTypes.instanceOf(Element) });

PropTypes.ref = PropTypes.oneOfType([
  // Either a function
  PropTypes.func,
  // Or the instance of a DOM native element (see the note about SSR)
  PropTypes.refObject,
]);

PropTypes.children = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]);

PropTypes.oneChild = PropTypes.node;

PropTypes.all = all;

PropTypes.isRequiredForA11y = isRequiredForA11y;

PropTypes.primitive = PropTypes.oneOfType([
  PropTypes.bool,
  PropTypes.number,
  PropTypes.string,
]);

PropTypes.lazy = function lazy (f) {
  return function () {
    return f().apply(this, arguments); // eslint-disable-line prefer-rest-params
  };
};

export default PropTypes;



export function createChainableTypeChecker (validate) {
  function checkType (
    isRequired,
    props,
    propName,
    componentName,
    location,
    propFullName,
    ...args
  ) {
    const componentNameSafe = componentName || '<<anonymous>>';
    const propFullNameSafe = propFullName || propName;

    if (props[propName]) {
      if (isRequired) {
        return new Error(
          `Required ${location} \`${propFullNameSafe}\` was not specified `
          + `in \`${componentNameSafe}\`.`,
        );
      }

      return null;
    }

    return validate(
      props,
      propName,
      componentNameSafe,
      location,
      propFullNameSafe,
      ...args,
    );
  }

  const chainedCheckType = checkType.bind(null, false);
  chainedCheckType.isRequired = checkType.bind(null, true);

  return chainedCheckType;
}

export function all (...validators) {
  function allPropTypes (...args) {
    let error = null;

    validators.forEach((validator) => {
      if (error) {
        return;
      }

      const result = validator(...args);
      if (result) {
        error = result;
      }
    });

    return error;
  }

  return createChainableTypeChecker(allPropTypes);
}

export function isRequiredForA11y (validator) {
  return function validate (
    props, propName, componentName, location, propFullName, ...args
  ) {
    const componentNameSafe = componentName || '<<anonymous>>';
    const propFullNameSafe = propFullName || propName;

    if (!props[propName]) {
      return new Error(
        `The ${location} \`${propFullNameSafe}\` is required to make `
        + `\`${componentNameSafe}\` accessible for users of assistive `
        + 'technologies such as screen readers.',
      );
    }

    return validator(
      props, propName, componentName, location, propFullName, ...args,
    );
  };
}

