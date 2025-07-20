import { useState, useEffect, useRef } from 'react';

const LazyImage = ({
    src,
    alt,
    className = '',
    placeholder = '/img/placeholder.png',
    onLoad,
    onError,
    ...props
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const observerRef = useRef();

    useEffect(() => {
        let observer;
        if (imageRef) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setImageSrc(src);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        rootMargin: '50px 0px',
                        threshold: 0.01
                    }
                );
                observer.observe(imageRef);
                observerRef.current = observer;
            } else {
                // Fallback for browsers that don't support IntersectionObserver
                setImageSrc(src);
            }
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [src, imageRef]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoaded(false);
        onError?.();
    };

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
                transition: 'opacity 0.3s ease-in-out'
            }}
            {...props}
        />
    );
};

export default LazyImage; 