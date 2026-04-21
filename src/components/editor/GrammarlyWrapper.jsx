// src/components/editor/GrammarlyWrapper.jsx
import { useEffect, useRef } from 'react';
import { init } from '@grammarly/editor-sdk';

export default function GrammarlyWrapper({ children, enabled = true }) {
  const editorRef = useRef(null);
  const grammarlyInstanceRef = useRef(null);

  useEffect(() => {
    if (!enabled || !editorRef.current) return;

    let isMounted = true;

    const initGrammarly = async () => {
      try {
        const instance = await init(editorRef.current, {
          clientId: process.env.NEXT_PUBLIC_GRAMMARLY_CLIENT_ID || 'client_9m1fYS3qQvxUyjgVw6NMBX',
          autocomplete: 'on',
          documentDialect: 'american', // Changed from 'british' to 'american'
          activation: 'immediate',
        });
        
        if (isMounted) {
          grammarlyInstanceRef.current = instance;
        } else if (instance && typeof instance.unmount === 'function') {
          instance.unmount();
        }
      } catch (error) {
        console.error('Grammarly initialization error:', error);
      }
    };

    initGrammarly();

    return () => {
      isMounted = false;
      
      if (grammarlyInstanceRef.current) {
        if (typeof grammarlyInstanceRef.current.unmount === 'function') {
          grammarlyInstanceRef.current.unmount();
        } else if (typeof grammarlyInstanceRef.current.destroy === 'function') {
          grammarlyInstanceRef.current.destroy();
        }
        grammarlyInstanceRef.current = null;
      }
    };
  }, [enabled]);

  return (
    <div ref={editorRef} className="grammarly-editor-wrapper">
      {children}
    </div>
  );
}