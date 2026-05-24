import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      shortcuts.forEach(({ combo, handler }) => {
        const [mod, key] = combo.toLowerCase().split('+');
        const modPressed = mod === 'ctrl' ? (event.ctrlKey || event.metaKey) : true;
        if (modPressed && event.key.toLowerCase() === key) {
          event.preventDefault();
          handler();
        }
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
