
import { useRef, forwardRef } from 'react';
import { render, createPortal } from 'react-dom';
import useWillUnmount from 'common/hooks/useWillUnmount';
import PropTypes from 'common/prop-types';

function attachStyles (parent, onReady) {
  const stylesLink = document.createElement('link');
  stylesLink.setAttribute('rel', 'stylesheet');
  stylesLink.setAttribute('type', 'text/css');
  stylesLink.setAttribute('href', '/react/react.css');
  stylesLink.onload = onReady;
  parent.appendChild(stylesLink);
}

export default function mount (app, {
  target = '.react-bind',
} = {}) {

  const rootElement = document.querySelector(target);
  if (!rootElement) throw new Error('Could not locate binding element on page');

  const shadow = rootElement.attachShadow({ mode: 'open' });

  const renderNode = document.createElement('div');
  shadow.appendChild(renderNode);

  attachStyles(shadow, () => {
    render(app, renderNode);
  });
}

const BodyMountManager = new (class BodyMountManager {

  constructor () {
    const parent = document.createElement('div');
    const shadow = parent.attachShadow({ mode: 'open' });

    const renderNode = document.createElement('div');
    shadow.appendChild(renderNode);

    attachStyles(shadow);

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

});

export const BodyMount = forwardRef(({ children, source, isStatic }, ref) => {

  const mountRef = useRef();
  if (!mountRef.current) {
    mountRef.current = BodyMountManager.attach({ ref, source });
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
