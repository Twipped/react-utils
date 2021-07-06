
import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';
import { get } from 'common/utils';

const WithContext = createContext();
WithContext.displayName = 'With';

function useWith (path) {
  const data = useContext(WithContext);
  if (path) return get(data, path);
  return data;
}

function With ({ children, value, ...props }) {
  if (useContext(WithContext)) return children;

  return <WithContext.Provider value={value || props}>{children}</WithContext.Provider>;
}
With.displayName = 'With';
With.propTypes = {
  value: PropTypes.any,
};

export {
  useWith,
  With,
  WithContext,
};
