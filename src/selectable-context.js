import PropTypes from 'prop-types';
import { useContext, createContext } from 'react';
import useMemoObject from 'common/hooks/useMemoObject';

export const SelectableContext = createContext(null);
SelectableContext.displayName = 'SelectableContext';

export function SelectableContextProvider ({ activeKey, onSelect = null, children }) {
  return (
    <SelectableContext.Provider value={useMemoObject({ activeKey, onSelect })}>{children}</SelectableContext.Provider>
  );
}
SelectableContextProvider.propTypes = {
  activeKey: PropTypes.any,
  onSelect: PropTypes.func,
};

export default function useSelectContext () {
  return useContext(SelectableContext) || {};
}
