import React, { useEffect } from 'react';

type BackgroundRef = React.RefObject<HTMLDivElement>;
type Handler = () => void;

/**
 * Handle background click for the backdrop
 * @param {BackgroundRef} backgroundRef - ref for the background div
 * @param {Handler} handler - handler for the click
 * @returns {void}
 */
export default function useClickOutside(
  backgroundRef: BackgroundRef,
  handler: Handler,
): void {
  useEffect(
    (): (() => void) => {
      function handleClickOutside(event: any): void {
        if (backgroundRef.current && backgroundRef.current.contains(event.target)) {
          handler();
        }
      }

      document.addEventListener('mousedown', handleClickOutside);

      return (): void => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    },
    [
      backgroundRef,
      handler,
    ],
  );
}
