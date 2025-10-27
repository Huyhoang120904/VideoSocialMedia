import { useEffect, useRef, useState } from "react";

/**
 * Performance monitoring utilities for React components
 */

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdate: number;
}

/**
 * Hook to measure component render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStart = useRef<number>(0);
  const mountStart = useRef<number>(0);
  const updateCount = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdate: 0,
  });

  useEffect(() => {
    mountStart.current = performance.now();
    updateCount.current = 0;

    return () => {
      const mountTime = performance.now() - mountStart.current;
      console.log(
        `[Performance] ${componentName} mounted in ${mountTime.toFixed(2)}ms`
      );
    };
  }, [componentName]);

  useEffect(() => {
    renderStart.current = performance.now();
    updateCount.current += 1;

    const measureRender = () => {
      const renderTime = performance.now() - renderStart.current;
      const lastUpdate = Date.now();

      setMetrics({
        renderTime,
        mountTime: metrics.mountTime,
        updateCount: updateCount.current,
        lastUpdate,
      });

      // Log slow renders in development
      if (process.env.NODE_ENV === "development" && renderTime > 16) {
        console.warn(
          `[Performance] ${componentName} slow render: ${renderTime.toFixed(
            2
          )}ms (${updateCount.current} updates)`
        );
      }
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRender);
  });

  return metrics;
}

/**
 * Hook to measure async operation performance
 */
export function useAsyncPerformance<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const [performance, setPerformance] = useState<{
    startTime: number;
    endTime: number;
    duration: number;
  } | null>(null);

  const execute = async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      const endTime = performance.now();

      setData(result);
      setPerformance({
        startTime,
        endTime,
        duration: endTime - startTime,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, deps);

  return {
    data,
    isLoading,
    error,
    performance,
    refetch: execute,
  };
}

/**
 * Hook to detect unnecessary re-renders
 */
export function useRenderTracker(componentName: string) {
  const renderCount = useRef(0);
  const prevProps = useRef<any>({});
  const prevState = useRef<any>({});

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[RenderTracker] ${componentName} rendered ${renderCount.current} times`
      );
    }
  });

  const trackProps = (props: any) => {
    if (process.env.NODE_ENV === "development") {
      const changedProps = Object.keys(props).filter(
        (key) => prevProps.current[key] !== props[key]
      );

      if (changedProps.length > 0) {
        console.log(
          `[RenderTracker] ${componentName} props changed:`,
          changedProps
        );
      }

      prevProps.current = props;
    }
  };

  const trackState = (state: any) => {
    if (process.env.NODE_ENV === "development") {
      const changedState = Object.keys(state).filter(
        (key) => prevState.current[key] !== state[key]
      );

      if (changedState.length > 0) {
        console.log(
          `[RenderTracker] ${componentName} state changed:`,
          changedState
        );
      }

      prevState.current = state;
    }
  };

  return {
    renderCount: renderCount.current,
    trackProps,
    trackState,
  };
}

/**
 * Hook to optimize expensive calculations
 */
export function useExpensiveCalculation<T>(
  calculation: () => T,
  deps: React.DependencyList,
  options: {
    maxCacheSize?: number;
    cacheKey?: string;
  } = {}
) {
  const cache = useRef<Map<string, T>>(new Map());
  const [result, setResult] = useState<T>(() => calculation());

  useEffect(() => {
    const cacheKey = options.cacheKey || JSON.stringify(deps);

    if (cache.current.has(cacheKey)) {
      setResult(cache.current.get(cacheKey)!);
      return;
    }

    const startTime = performance.now();
    const calculatedResult = calculation();
    const endTime = performance.now();

    // Log expensive calculations in development
    if (process.env.NODE_ENV === "development" && endTime - startTime > 5) {
      console.warn(
        `[Performance] Expensive calculation took ${(
          endTime - startTime
        ).toFixed(2)}ms`
      );
    }

    cache.current.set(cacheKey, calculatedResult);
    setResult(calculatedResult);

    // Clean up cache if it gets too large
    if (options.maxCacheSize && cache.current.size > options.maxCacheSize) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }
  }, deps);

  return result;
}

/**
 * Hook to measure memory usage (if available)
 */
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name =
      componentName || Component.displayName || Component.name || "Unknown";
    const metrics = useRenderPerformance(name);
    const tracker = useRenderTracker(name);

    // Track props changes
    tracker.trackProps(props);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${
    componentName || Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
