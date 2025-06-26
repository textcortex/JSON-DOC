import React from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

function GlobalErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.log("error ", error);
  return (
    <div className="json-doc-error-boundary" role="alert">
      <div className="json-doc-error-content">
        <h2>Document Failed to Load</h2>
        <p>Something went wrong while rendering this document.</p>
        <pre>
          <strong>Message:</strong> {error.message}
          {error.stack && (
            <div>
              <strong>Stack Trace:</strong>
              {error.stack}
            </div>
          )}
        </pre>

        <button
          onClick={resetErrorBoundary}
          className="json-doc-error-retry-button"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function GlobalErrorBoundary({
  children,
  onError,
}: GlobalErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onError={onError}
      onReset={() => {
        // Optional: Add any cleanup logic here
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
