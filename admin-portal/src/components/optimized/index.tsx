import React, { memo, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { BaseComponentProps } from "@/types";

// ============================================================================
// MEMOIZED ATOMIC COMPONENTS
// ============================================================================

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(
  ({ className, size = "md", text }) => {
    const sizeClasses = useMemo(
      () => ({
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
      }),
      []
    );

    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "animate-spin rounded-full border-2 border-primary border-t-transparent",
              sizeClasses[size]
            )}
          />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

interface EmptyStateProps extends BaseComponentProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = memo<EmptyStateProps>(
  ({ className, icon: Icon, title, description, action }) => {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
      >
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-4 text-center text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
        {action && action}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

interface StatusBadgeProps extends BaseComponentProps {
  status: "active" | "inactive" | "pending" | "error" | "success";
  children: React.ReactNode;
}

export const StatusBadge = memo<StatusBadgeProps>(
  ({ className, status, children }) => {
    const statusClasses = useMemo(
      () => ({
        active:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        inactive:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        pending:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        success:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      }),
      []
    );

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          statusClasses[status],
          className
        )}
      >
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

interface PageHeaderProps extends BaseComponentProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader = memo<PageHeaderProps>(
  ({ className, title, description, action }) => {
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";

interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = memo<StatsCardProps>(
  ({ className, title, value, description, icon: Icon, trend }) => {
    return (
      <div className={cn("rounded-lg border bg-card p-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * Custom hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for throttling function calls
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = React.useRef(Date.now());

  return React.useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

/**
 * Custom hook for virtual scrolling
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = React.useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;
  const offsetY = Math.floor(scrollTop / itemHeight) * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

/**
 * Higher-order component for lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: Component })
  );

  return memo((props: P) => (
    <React.Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </React.Suspense>
  ));
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}
