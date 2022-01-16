/* eslint no-mixed-operators: 0 */

import bezier from 'bezier-easing';

export const standard = bezier(0.4, 0, 0.2, 1);
export const emphasized = bezier(0.4, 0, 0, 1);
export const decelerated = bezier(0.0, 0, 0.2, 1);
export const accelerated = bezier(0.4, 0, 1, 1);
export const sharp = bezier(0.4, 0, 0.6, 1);

/* https://github.com/oblador/angular-scroll (duScrollDefaultEasing) */
export const angular = (x) => {
  if (x < 0.5) {
    return Math.pow(x * 2, 2) / 2;
  }
  return 1 - Math.pow((1 - x) * 2, 2) / 2;
};

/* https://gist.github.com/gre/1650294 */

export const linear = (t) => t;
// accelerating from zero velocity
export const easeInQuad = (t) => t * t;
// decelerating to zero velocity
export const easeOutQuad = (t) => t * (2 - t);
// acceleration until halfway, then deceleration
export const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
// accelerating from zero velocity
export const easeInCubic = (t) => t * t * t;
// decelerating to zero velocity
export const easeOutCubic = (t) => (--t) * t * t + 1;
// acceleration until halfway, then deceleration
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1);
// accelerating from zero velocity
export const easeInQuart = (t) => t * t * t * t;
// decelerating to zero velocity
export const easeOutQuart = (t) => 1 - (--t) * t * t * t;
// acceleration until halfway, then deceleration
export const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t);
// accelerating from zero velocity
export const easeInQuint = (t) => t * t * t * t * t;
// decelerating to zero velocity
export const easeOutQuint = (t) => 1 + (--t) * t * t * t * t;
// acceleration until halfway, then deceleration
export const easeInOutQuint = (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t);

const EASING = {
  standard,
  emphasized,
  decelerated,
  accelerated,
  sharp,

  angular,

  linear,
  'ease-in': easeInQuad,
  'ease-out': easeOutQuad,
  'ease-in-out': easeInOutQuad,
  'ease-in-cubic': easeInCubic,
  'ease-out-cubic': easeOutCubic,
  'ease-in-out-cubic': easeInOutCubic,
  'ease-in-quart': easeInQuart,
  'ease-out-quart': easeOutQuart,
  'ease-in-out-quart': easeInOutQuart,
  'ease-in-quint': easeInQuint,
  'ease-out-quint': easeOutQuint,
  'ease-in-out-quint': easeInOutQuint,

  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
};

export default EASING;
