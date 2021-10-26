import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSafeState from 'common/hooks/useSafeState';

import arrow from '@popperjs/core/lib/modifiers/arrow';
import computeStyles from '@popperjs/core/lib/modifiers/computeStyles';
import eventListeners from '@popperjs/core/lib/modifiers/eventListeners';
import flip from '@popperjs/core/lib/modifiers/flip';
import hide from '@popperjs/core/lib/modifiers/hide';
import offset from '@popperjs/core/lib/modifiers/offset';
import popperOffsets from '@popperjs/core/lib/modifiers/popperOffsets';
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow';
export { placements } from '@popperjs/core/lib/enums';
import { popperGenerator } from '@popperjs/core/lib/popper-base';

const resolveRef = (ref) => ref && ('current' in ref ? ref.current : ref);

export var createPopper = popperGenerator({
  defaultModifiers: [ hide, popperOffsets, computeStyles, eventListeners, offset, flip, preventOverflow, arrow ],
});

var initialPopperStyles = (position) => ({
  position,
  top: '0',
  left: '0',
  opacity: '0',
  pointerEvents: 'none',
});


const disabledApplyStylesModifier = { name: 'applyStyles', enabled: false };

export const minWidthModifier = {
  name: "sameWidth",
  enabled: true,
  phase: "beforeWrite",
  requires: [ 'computeStyles' ],
  fn: ({ state }) => {
    if (state.options.placement === 'top' || state.options.placement === 'bottom') {
      state.styles.popper.minWidth = state.rects.reference.width + 'px';
    }
  },
  effect: ({ state }) => {
    if (state.options.placement === 'top' || state.options.placement === 'bottom') {
      state.elements.popper.style.minWidth = state.elements.reference.offsetWidth + 'px';
    }
  },
};

const EMPTY_MODIFIERS = [ ];
/**
 * Position an element relative some reference element using Popper.js
 *
 * @param referenceElement
 * @param popperElement
 * @param {object}      options
 * @param {object=}     options.modifiers Popper.js modifiers
 * @param {boolean=}    options.enabled toggle the popper functionality on/off
 * @param {string=}     options.placement The popper element placement relative to the reference element
 * @param {string=}     options.strategy the positioning strategy
 * @param {boolean=}    options.eventsEnabled have Popper listen on window resize events to reposition the element
 * @param {function=}   options.onCreate called when the popper is created
 * @param {function=}   options.onUpdate called when the popper is updated
 *
 * @returns {UsePopperState} The popper state
 */
function usePopper (referenceElement, popperElement, {
  enabled = true,
  placement = 'bottom',
  strategy = 'absolute',
  modifiers = EMPTY_MODIFIERS,
  ...config
}) {
  const popperInstanceRef = useRef();
  referenceElement = resolveRef(referenceElement);
  popperElement = resolveRef(popperElement);

  const update = useCallback(() => {
    popperInstanceRef.current?.update();
  }, []);

  const forceUpdate = useCallback(() =>
    popperInstanceRef && popperInstanceRef.current && popperInstanceRef.current.forceUpdate(),
  []);

  const [ popperState, setState ] = useSafeState(
    useState({
      placement,
      update,
      forceUpdate,
      attributes: {},
      styles: {
        popper: initialPopperStyles(strategy),
        arrow: {},
      },
    }),
  );

  const updateModifier = useMemo(() => ({
    name: 'updateStateModifier',
    enabled: true,
    phase: 'write',
    requires: [ 'computeStyles' ],
    fn: ({ state }) => {
      const styles = {};
      const attributes = {};

      Object.keys(state.elements).forEach((element) => {
        styles[element] = state.styles[element];
        attributes[element] = state.attributes[element];
      });

      setState({
        state,
        styles,
        attributes,
        update,
        forceUpdate,
        placement: state.placement,
      });
    },
  }), [ update, forceUpdate, setState ]);

  useEffect(() => {
    if (!popperInstanceRef.current || !enabled) return;

    popperInstanceRef.current.setOptions({
      placement,
      strategy,
      modifiers: [ ...modifiers, minWidthModifier, updateModifier, disabledApplyStylesModifier ],
    });

    // intentionally NOT re-running on new modifiers
  }, [ strategy, placement, updateModifier, enabled ]);

  useEffect(() => {
    if (!enabled || !referenceElement || !popperElement) {
      return undefined;
    }

    popperInstanceRef.current = createPopper(referenceElement, popperElement, {
      ...config,
      placement,
      strategy,
      modifiers: [ ...modifiers, minWidthModifier, updateModifier ],
    });

    return () => {
      if (popperInstanceRef.current) {
        popperInstanceRef.current.destroy();
        popperInstanceRef.current = undefined;

        setState((s) => ({
          ...s,
          attributes: {},
        }));
      }
    };
    // This is only run once to _create_ the popper
  }, [ enabled, referenceElement, popperElement ]);

  return popperState;
}

export default usePopper;
