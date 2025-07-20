import React from 'react';
import { useDraggable } from '../hooks/useDraggable';

const DraggableBell = ({
    onClick,
    children,
    className = '',
    initialPosition = { x: 20, y: 20 },
    onPositionChange
}) => {
    const { position, isDragging, elementRef, setPosition } = useDraggable(initialPosition);

    // 위치 변경 시 콜백 호출
    React.useEffect(() => {
        if (onPositionChange) {
            onPositionChange(position);
        }
    }, [position, onPositionChange]);

    return (
        <div
            ref={elementRef}
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 1000,
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none',
                transition: isDragging ? 'none' : 'box-shadow 0.2s ease',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#126d5f',
                borderRadius: '50%',
                boxShadow: isDragging
                    ? '0 8px 16px rgba(0,0,0,0.4)'
                    : '0 4px 8px rgba(0,0,0,0.2)',
                border: '2px solid #0e0e11'
            }}
            className={`draggable-bell ${className}`}
            title="드래그하여 위치 이동"
        >
            <div
                onClick={onClick}
                style={{
                    cursor: 'pointer',
                    opacity: isDragging ? 0.8 : 1,
                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.1s ease, opacity 0.1s ease',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default DraggableBell; 