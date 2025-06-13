// Error handler to suppress browser extension errors and non-critical warnings
(function() {
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // List of error messages to suppress (from browser extensions)
  const suppressedErrors = [
    'A listener indicated an asynchronous response by returning true',
    'Node cannot be found in the current page',
    'bybit:page provider inject code',
    'Extension context invalidated',
    'Could not establish connection',
    'chrome-extension://',
    'moz-extension://'
  ];

  // Override console.error
  console.error = function(...args) {
    const errorMessage = args.join(' ');
    
    // Check if this is a browser extension error
    const shouldSuppress = suppressedErrors.some(suppressedError => 
      errorMessage.includes(suppressedError)
    );
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  // Override console.warn
  console.warn = function(...args) {
    const warnMessage = args.join(' ');
    
    // Check if this is a browser extension warning
    const shouldSuppress = suppressedErrors.some(suppressedError => 
      warnMessage.includes(suppressedError)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Catch unhandled promise rejections from browser extensions
  window.addEventListener('unhandledrejection', function(event) {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    
    const shouldSuppress = suppressedErrors.some(suppressedError => 
      errorMessage.includes(suppressedError)
    );
    
    if (shouldSuppress) {
      event.preventDefault();
    }
  });

  // Catch general errors from browser extensions
  window.addEventListener('error', function(event) {
    const errorMessage = event.error?.message || event.message || '';
    
    const shouldSuppress = suppressedErrors.some(suppressedError => 
      errorMessage.includes(suppressedError)
    );
    
    if (shouldSuppress) {
      event.preventDefault();
    }
  });
})();
