import { useEffect, type RefObject } from 'react';

export interface VideoPlayerProps {
    videoRef: RefObject<HTMLVideoElement>;
}

/**
 * Captures and displays the live webcam feed.
 * Exposes a ref to allow external engines to read the video frames.
 */
export const VideoPlayer = ({ videoRef }: VideoPlayerProps) => {
    useEffect(() => {
        let stream: MediaStream | null = null;
        let cancelled = false;

        const startCamera = async (): Promise<void> => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 1280,
                        height: 720,
                        facingMode: 'user',
                    },
                });

                if (!cancelled && videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Camera access denied or unavailable', err);
            }
        };

        void startCamera();

        return () => {
            cancelled = true;

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
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