import { useState, useEffect } from 'react';
import styles from '../styles/CustomCursor.module.css'; // Make sure the path is correct

const CustomCursor = ({ useCustomCursor }) => {
    const [position, setPosition] = useState({ x: -100, y: -100 }); // Nyan Cat starts off-screen
    const [splashes, setSplashes] = useState([]); // Track active splashes

    // Update Nyan Cat cursor position as the mouse moves
    const moveCursor = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
    };

    // Handle mouse click to create a new splash effect
    const handleMouseDown = (e) => {
        const clickX = e.clientX;
        const clickY = e.clientY;

        // Generate particles for the splash
        const numParticles = 15;
        const newParticles = Array.from({ length: numParticles }, (_, i) => {
            const angle = (i / numParticles) * 2 * Math.PI;
            const x = 60 * Math.cos(angle);
            const y = 60 * Math.sin(angle);
            return { id: i, x: `${x}px`, y: `${y}px` };
        });

        // Add a new splash to the splashes array
        const newSplash = {
            id: Date.now(),
            position: { x: clickX, y: clickY },
            particles: newParticles,
        };

        setSplashes((prevSplashes) => [...prevSplashes, newSplash]);

        // Remove splash after 1.5s
        setTimeout(() => {
            setSplashes((prevSplashes) =>
                prevSplashes.filter((splash) => splash.id !== newSplash.id)
            );
        }, 1500);
    };

    // Add event listeners when custom cursor is enabled
    useEffect(() => {
        if (useCustomCursor) {
            window.addEventListener('mousemove', moveCursor);
            window.addEventListener('mousedown', handleMouseDown);
        } else {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
        }

        // Clean up event listeners on unmount
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [useCustomCursor]);

    // Don't render anything if custom cursor is disabled
    if (!useCustomCursor) return null;

    return (
        <>
            {/* Hide system cursor and display custom one */}
            <div className={styles.cursorHidden}>
                {/* Nyan Cat Cursor following mouse movement */}
                {position && (
                    <div
                        className={styles.nyanCat}
                        style={{ left: `${position.x}px`, top: `${position.y}px` }}
                    />
                )}

                {/* Render all active splash effects */}
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
                                    '--x': particle.x,
                                    '--y': particle.y,
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
