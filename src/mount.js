
import { useRef, useEffect, useCallback, forwardRef, createContext, useContext, cloneElement } from 'react';
import { render, createPortal } from 'react-dom';
import useWillUnmount from 'common/hooks/useWillUnmount';
import useForceUpdate from 'common/hooks/useForceUpdate';
import PropTypes from 'prop-types';
import { noop, map, isFunction } from 'common/utils';

function attachStyles (parent, filename, onReady) {
  const stylesLink = document.createElement('link');
  stylesLink.setAttribute('rel', 'stylesheet');
  stylesLink.setAttribute('type', 'text/css');
  stylesLink.setAttribute('href', filename);
  stylesLink.onload = onReady;
  parent.appendChild(stylesLink);
}

export const MountContext = createContext(null);
MountContext.displayName = 'MountContext';


export default function mount (app, {
  target = '.react-bind',
  css,
} = {}) {

  const rootElement = document.querySelector(target);
  if (!rootElement) throw new Error('Could not locate binding element on page');

  const shadow = rootElement.attachShadow({ mode: 'open' });

  const renderNode = document.createElement('div');
  shadow.appendChild(renderNode);

  const context = {
    bodyMountManager: new BodyMountManager({ css }),
    orphans: new Map(),
    rollcall: noop,
    cssFile: css,
    renderNode,
    shadow,
  };

  attachStyles(shadow, css, () => {
    render(<MountContext.Provider value={context}>{app}<Orphanage /></MountContext.Provider>, renderNode);
  });
}

export const BodyMount = forwardRef(({ children, source, isStatic }, ref) => {

  const { bodyMountManager } = useContext(MountContext);
  const mountRef = useRef();
  if (!mountRef.current) {
    mountRef.current = bodyMountManager.attach({ ref, source });
  }
  const [ mountPoint, dispose ] = mountRef.current;

  useWillUnmount(dispose);

  if (isStatic) return children;

  return createPortal(<>{children}</>, mountPoint);
});
BodyMount.displayName = 'BodyMount';
BodyMount.propTypes = {
  source: PropTypes.string,
  isStatic: PropTypes.bool,
};

class BodyMountManager {

  constructor ({ css }) {
    const parent = document.createElement('div');
    const shadow = parent.attachShadow({ mode: 'open' });

    const renderNode = document.createElement('div');
    shadow.appendChild(renderNode);

    attachStyles(shadow, css);

    this.parentNode = parent;
    this.shadowNode = shadow;
    this.mounts = new Set;
  }

  attach ({ ref, source }) {
    if (!this.mounts.size) document.body.appendChild(this.parentNode);

    const mountPoint = document.createElement('div');
    if (source) mountPoint.setAttribute('data-source', source);
    this.shadowNode.appendChild(mountPoint);

    this.mounts.add(mountPoint);

    if (typeof ref === 'function') ref(mountPoint);
    else if (ref && 'current' in ref) ref.current = mountPoint;

    const dispose = () => {
      this.detatch(mountPoint);
      if (typeof ref === 'function') ref(null);
      else if (ref && 'current' in ref) ref.current = null;
    };

    return [ mountPoint, dispose ];
  }

  detatch (mountPoint) {
    this.mounts.delete(mountPoint);
    this.shadowNode.removeChild(mountPoint);
    if (!this.mounts.size) document.body.removeChild(this.parentNode);
  }

}

function Orphanage () {
  const { orphans } = useContext(MountContext);
  const update = useForceUpdate();
  orphans.updated = update;

  if (!orphans.size) return null;

  return map(orphans, (Component, k, i) => {
    if (isFunction(Component)) return <Component key={i} />;
    return cloneElement(Component, { key: i });
  });
}

export function useOrphanage () {
  const { orphans } = useContext(MountContext);

  return {
    createOrphan (orphan) {
      const id = Symbol('Orphan');
      orphans.set(id, orphan);
      orphans.updated && orphans.updated();
      return () => {
        orphans.delete(id);
        orphans.updated && orphans.updated();
      };
    },
  };
}

export function useOrphan (body) {
  const { orphans } = useContext(MountContext);
  const bodyRef = useRef(body);
  bodyRef.current = body;

  const Orphan = useCallback(() => bodyRef.current);

  useEffect(() => {
    const id = Symbol('Orphan');
    orphans.set(id, Orphan);
    orphans.updated && orphans.updated();
    return () => {
      orphans.delete(id);
      orphans.updated && orphans.updated();
    };
  }, []);

}
