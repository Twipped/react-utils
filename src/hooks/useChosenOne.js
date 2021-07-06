
import { useState } from 'react';
import useWillMount from './useWillMount';

export class Manager {

  constructor () {
    this.hooks = [];
  }

  get active () {
    return !!this.hooks.length;
  }

  get first () {
    return this.hooks[0];
  }

  get last () {
    return this.hooks[this.hooks.length - 1];
  }

  isFirst (ref) {
    return ref === this.first;
  }

  isLast (ref) {
    return ref === this.last;
  }

  push (ref) {
    const prevLast = this.last;
    this.hooks.push(ref);
    prevLast && prevLast([ this.hooks.length === 2, false ]);
    return [ !prevLast, true ];
  }

  unshift (ref) {
    const prevFirst = this.last;
    this.hooks.push(ref);
    prevFirst([ false, this.hooks.length === 2 ]);
    return [ true, !prevFirst ];
  }

  pop () {
    const ref = this.hooks.pop();
    const last = this.last;
    if (!last) return;
    // if there's only one ref, then it's the first.
    last([ this.hooks.length === 1, true ]);
    return ref;
  }

  shift () {
    const ref = this.modals.shift();
    const first = this.first;
    if (!first) return;
    first([ true, this.hooks.length === 1 ]);
    return ref;
  }

  cut (idx) {
    return this.hooks.splice(idx, 1);
  }

  remove (ref) {
    if (ref === this.last) {
      return this.pop();
    }

    if (ref === this.first) {
      return this.shift();
    }

    const idx = this.hooks.indexOf(ref);
    if (idx < 0) return;
    return this.cut();
  }

}

const Managers = new Map;

export default function useChosenOne (channel) {
  if (!Managers.has(channel)) Managers.set(channel, new Manager);
  const manager = Managers.get(channel);

  const [ [ first, last ], setState ] = useState([ false, false ]);

  useWillMount(
    () => setState(manager.push(setState)),
    () => manager.remove(setState),
  );

  return { first, last };
}
