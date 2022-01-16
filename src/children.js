import { Children, isValidElement, cloneElement, Fragment } from 'react';
import { iteratee, isObject, isPrimitive } from '@twipped/utils';

export function* childIterator (children) {
  for (const child of Children.toArray(children)) {
    if (isFragment(child)) {
      yield* childIterator(child.props.children);
      continue;
    }
    yield child;
  }
}

export function* childDescender (children) {
  for (const child of Children.toArray(children)) {
    if (child.props && child.props.children) {
      yield* childDescender(child.props.children);
      continue;
    }
    yield child;
  }
}

const NATURAL_KEY = /^\.\d+$/;

/**
 * Iterates through children that are typically specified as `props.children`,
 * returning only the children where the predicate results in a truthy return
 *
 */
export function filterChildren (children, predicate) {
  predicate = iteratee(predicate);
  children = Children.toArray(children);

  let index = 0;
  const result = [];
  for (const child of childIterator(children)) {
    const res = predicate(child, index++, children);
    if (res) result.push(child);
  }

  return result;
}

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
  for (const child of childIterator(children)) {
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
  for (const child of childIterator(children)) {
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
    func = (p) => ({ ...p, ...props });
  }

  let i = 0;
  const results = [];

  for (const child of childIterator(children)) {
    if (!isValidElement(child)) continue;

    let res = func(child.props, child, i++);

    if (!res) continue;
    if (res && !isValidElement(res) && !isObject(res)) {
      throw new TypeError('cloneChildren received a value it does not know how to process: ' + res);
    }

    if (isValidElement(res)) {
      const key = NATURAL_KEY.exec(res.key) ? `.${i - 1}` : res.key;
      res = <res.type ref={res.ref} key={key} {...res.props} />;
    } else if (isObject(res)) {
      const key = NATURAL_KEY.exec(child.key) ? `.${i - 1}` : child.key;
      res = <child.type ref={child.ref} key={key} {...res} />;
    }

    results.push(res);
  }

  return results;
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
    typeof component === 'function' && component.prototype && component.prototype.isReactComponent
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

export function isFragment (variableToInspect) {
  if (variableToInspect.type) {
    return variableToInspect.type === Fragment;
  }
  return variableToInspect === Fragment;
}

// deprecated apis
export const map = mapChildren;
export const forEach = forEachChild;

