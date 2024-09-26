import { useState, useEffect } from 'react';
import styles from '../styles/CustomCursor.module.css'; // Import CSS

const CustomCursor = () => {
    const [position, setPosition] = useState(null); // For Nyan Cat cursor
    const [splashes, setSplashes] = useState([]); // Track all active splashes

    // Update Nyan Cat cursor position as the mouse moves
    const moveCursor = (e) => {
        setPosition({ x: e.clientX, y: e.clientY });
    };

    // Handle mouse click to create a new splash effect at the clicked position
    const handleMouseDown = (e) => {
        const clickX = e.clientX; // X position where the click happens
        const clickY = e.clientY; // Y position where the click happens

        // Generate 15 particles arranged in a circle
        const numParticles = 15; // Create 15 particles
        const newParticles = Array.from({ length: numParticles }, (_, i) => {
            const angle = (i / numParticles) * 2 * Math.PI; // Divide circle into 15 segments
            const x = 60 * Math.cos(angle); // Calculate X position for each particle
            const y = 60 * Math.sin(angle); // Calculate Y position for each particle
            return { id: i, x: `${x}px`, y: `${y}px` }; // Return particle with calculated position
        });

        // Add a new splash to the list of splashes
        const newSplash = {
            id: Date.now(), // Unique ID for each splash
            position: { x: clickX, y: clickY }, // Splash position
            particles: newParticles, // Particles for the splash
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
        window.addEventListener('mousemove', moveCursor); // Nyan Cat follows mouse movement
        window.addEventListener('mousedown', handleMouseDown); // Trigger splash on mouse down

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);

    return (
        <>
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
        </>
    );
};

export default CustomCursor;