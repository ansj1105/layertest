import { useEffect, useState } from 'react';

const PerformanceMonitor = () => {
    const [metrics, setMetrics] = useState({
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0
    });

    useEffect(() => {
        if ('PerformanceObserver' in window) {
            // First Contentful Paint
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcp = entries[entries.length - 1];
                setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
            });
            fcpObserver.observe({ entryTypes: ['paint'] });

            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lcp = entries[entries.length - 1];
                setMetrics(prev => ({ ...prev, lcp: lcp.startTime }));
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fid = entries[entries.length - 1];
                setMetrics(prev => ({ ...prev, fid: fid.processingStart - fid.startTime }));
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let cls = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                }
                setMetrics(prev => ({ ...prev, cls }));
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            return () => {
                fcpObserver.disconnect();
                lcpObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }
    }, []);

    // Only show in development
    if (import.meta.env.PROD) return null;

    return (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs z-50">
            <h3 className="font-bold mb-2">Performance Metrics</h3>
            <div className="space-y-1">
                <div>FCP: {metrics.fcp.toFixed(2)}ms</div>
                <div>LCP: {metrics.lcp.toFixed(2)}ms</div>
                <div>FID: {metrics.fid.toFixed(2)}ms</div>
                <div>CLS: {metrics.cls.toFixed(3)}</div>
            </div>
        </div>
    );
};

export default PerformanceMonitor; 