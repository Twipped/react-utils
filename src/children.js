import { Children, isValidElement, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { iteratee, isObject, isPrimitive } from 'common/utils';

/**
 * Iterates through children that are typically specified as `props.children`,
 * but only maps over children that are "valid elements".
 *
 * The mapFunction provided index will be normalised to the components mapped,
 * so an invalid component would not increase the index.
 *
 */
export function mapChildren (children, predicate, raw = false) {
  predicate = iteratee(predicate);
  children = Children.toArray(children);

  let index = 0;
  const result = [];
  for (const child of children) {
    if (!isValidElement(child)) {
      if (raw) result.push(child);
      continue;
    }
    const res = predicate(child, index++, children);
    result.push(res);
  }

  return result;
}

/**
 * Iterates through children that are "valid elements".
 *
 * The provided predicate(child, index) will be called for each
 * leaf child with the index reflecting the position relative to "valid components".
 * If the predicate returns false, the loop will exist.
 */
export function forEachChild (children, predicate) {
  predicate = iteratee(predicate);
  children = Children.toArray(children);

  let index = 0;
  for (const child of children) {
    if (!isValidElement(child)) continue;
    const res = predicate(child, index++, children);
    if (res === false) break;
  }

  return children;
}

export function firstChild (children, func) {
  if (isObject(func, true)) {
    const props = func;
    func = () => props;
  }

  const child = Children.only(children);
  if (!func) return child;
  const res = func(child.props, child);
  if (isValidElement(res)) return res;
  return res ? cloneElement(child, res) : child;
}

export function cloneChildren (children, func) {
  if (isObject(func, true)) {
    const props = func;
    func = () => props;
  }
  return map(children, (child, i) => {
    const res = func(child.props, child, i);
    if (isValidElement(res)) return res;
    return res ? cloneElement(child, res) : null;
  });
}

export function ensureChild (Child, props = null) {
  if (isPrimitive(Child)) return Child;
  if (isElement(Child)) return props ? cloneElement(Child, props) : Child;
  if (isComponent(Child)) return <Child {...props} />;
  if (typeof Child === 'function') return Child(props); // eslint-disable-line new-cap
  return null;
}

export function isClassComponent (component) {
  return (
    typeof component === 'function' &&
    !!component?.prototype?.isReactComponent
  );
}

export function isFunctionComponent (component) {
  return (
    typeof component === 'function' &&
    String(component).includes('eact.createElement')
  );
}

export function isComponent (component) {
  return (
    isClassComponent(component) ||
    isFunctionComponent(component)
  );
}

export function isElement (element) {
  return isValidElement(element);
}

// deprecated apis
export const map = mapChildren;
export const forEach = forEachChild;

