import { useState, useEffect } from 'react';

// Optimized imports for better performance
export const useOptimizedImport = () => {
    const [libraries, setLibraries] = useState({});

    useEffect(() => {
        // Dynamically import heavy libraries only when needed
        const loadLibraries = async () => {
            const [
                { default: Chart },
                { default: ChartJS },
                { default: Slider },
                { default: DatePicker }
            ] = await Promise.all([
                import('react-chartjs-2'),
                import('chart.js/auto'),
                import('react-slick'),
                import('react-datepicker')
            ]);

            setLibraries({
                Chart,
                ChartJS,
                Slider,
                DatePicker
            });
        };

        loadLibraries();
    }, []);

    return libraries;
};

// Optimized axios instance
export const useOptimizedAxios = () => {
    const [axiosInstance, setAxiosInstance] = useState(null);

    useEffect(() => {
        const loadAxios = async () => {
            const axios = await import('axios');
            const instance = axios.default.create({
                timeout: 10000,
                withCredentials: true
            });
            setAxiosInstance(instance);
        };

        loadAxios();
    }, []);

    return axiosInstance;
};

// Optimized i18n
export const useOptimizedI18n = () => {
    const [i18nInstance, setI18nInstance] = useState(null);

    useEffect(() => {
        const loadI18n = async () => {
            const { useTranslation } = await import('react-i18next');
            setI18nInstance(useTranslation);
        };

        loadI18n();
    }, []);

    return i18nInstance;
}; 