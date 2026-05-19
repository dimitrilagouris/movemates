import { useEffect, type RefObject } from 'react';

export interface VideoPlayerProps {
    videoRef: RefObject<HTMLVideoElement>;
}

/**
 * Captures and displays the live webcam feed.
 * Exposes a ref to allow external engines to read the video frames.
 */
export const VideoPlayer = ({ videoRef }: VideoPlayerProps): JSX.Element => {
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async (): Promise<void> => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: "user" }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied or unavailable", err);
            }
        };

        startCamera();

        // Cleanup tracks to release the camera when the component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [videoRef]);

    return (
        <video
            ref={videoRef}
            className="video-player"
            autoPlay
            playsInline
            muted
        />
    );
};