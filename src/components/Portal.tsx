<think>Create a new `Portal.tsx` component. This component will use `ReactDOM.createPortal` to render its children into the `modal-root` div in `index.html`. This is the core mechanism for global modal rendering.</think>
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  wrapperId?: string;
}

const Portal: React.FC<PortalProps> = ({ children, wrapperId = 'modal-root' }) => {
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(wrapperId);
    let systemCreated = false;

    if (!element) {
      systemCreated = true;
      element = document.createElement('div');
      element.setAttribute('id', wrapperId);
      document.body.appendChild(element);
    }
    setWrapperElement(element);

    return () => {
      // Clean up the element if it was created by the system
      if (systemCreated && element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [wrapperId]);

  if (!wrapperElement) {
    return null;
  }

  return createPortal(children, wrapperElement);
};

export default Portal;
