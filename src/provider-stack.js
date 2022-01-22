
import { Children, isValidElement, cloneElement } from 'react';

/**
 * Takes a linear series of child components without children, and nests each one into the one before.
 * So instead of <Provider1><Provider2><Provider3>{children}</Provider3></Provider2></Provider1>
 * You can do <ProviderStack><Provider1 /><Provider2 /><Provider3 /><>{children}</></ProviderStack>
 */
export default function ProviderStack ({ children }) {
  children = Children.toArray(children);
  let head = children.pop();

  while (children.length) {
    const limb = children.pop();
    if (!isValidElement(limb)) throw new Error(`ProviderStack: Item #${children.length} is not a react element.`);
    if (limb.props.children) throw new Error(`ProviderStack: Item #${children.length} already has children.`);

    head = cloneElement(limb, {}, head);
  }

  return head;
}
