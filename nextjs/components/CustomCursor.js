import { useState, useEffect } from 'react';
import styles from '../styles/CustomCursor.module.css'; // Import CSS

const CustomCursor = ({ useCustomCursor }) => {
    const [position, setPosition] = useState(null); // For Nyan Cat cursor
    const [splashes, setSplashes] = useState([]); // Track all active splashes

    // Update Nyan Cat cursor position as the mouse moves
    const moveCursor = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
    };

    // Handle mouse click to create a new splash effect at the clicked position
    const handleMouseDown = (e) => {
        const clickX = e.clientX;
        const clickY = e.clientY;

        // Generate 15 particles arranged in a circle
        const numParticles = 15;
        const newParticles = Array.from({ length: numParticles }, (_, i) => {
            const angle = (i / numParticles) * 2 * Math.PI;
            const x = 60 * Math.cos(angle);
            const y = 60 * Math.sin(angle);
            return { id: i, x: `${x}px`, y: `${y}px` };
        });

        // Add a new splash to the list of splashes
        const newSplash = {
            id: Date.now(),
            position: { x: clickX, y: clickY },
            particles: newParticles,
        };

        setSplashes((prevSplashes) => [...prevSplashes, newSplash]);

        // Remove this splash after the animation ends (1.5 seconds)
        setTimeout(() => {
            setSplashes((prevSplashes) =>
                prevSplashes.filter((splash) => splash.id !== newSplash.id)
            );
        }, 1500);
    };

    // Add event listeners for mouse movement and click
    useEffect(() => {
        if (useCustomCursor) {
            window.addEventListener('mousemove', moveCursor);
            window.addEventListener('mousedown', handleMouseDown);
        } else {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
        }

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [useCustomCursor]);

    if (!useCustomCursor) {
        // Don't render anything if custom cursor is disabled
        return null;
    }

    return (
        <>
            {/* Apply the cursorHidden class to hide the system cursor */}
            <div className={useCustomCursor ? styles.cursorHidden : ''}>
                {/* Nyan Cat Cursor follows the mouse */}
                {position && (
                    <div
                        className={styles.nyanCat}
                        style={{ left: `${position.x}px`, top: `${position.y}px` }}
                    />
                )}

                {/* Render multiple splashes */}
                {splashes.map((splash) => (
                    <div
                        key={splash.id}
                        className={styles.splash}
                        style={{ left: `${splash.position.x}px`, top: `${splash.position.y}px` }}
                    >
                        {splash.particles.map((particle) => (
                            <div
                                key={particle.id}
                                style={{
                                    '--x': particle.x, // X movement for particle
                                    '--y': particle.y, // Y movement for particle
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
};

export default CustomCursor;
