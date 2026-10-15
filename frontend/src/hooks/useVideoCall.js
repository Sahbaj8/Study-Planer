import { useState, useEffect, useRef, useCallback } from 'react';

export const useVideoCall = (user, isSupabaseConfigured = false) => {
  const [localStream, setLocalStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const localVideoRef = useRef(null);

  // Initialize camera and microphone stream
  const initMediaStream = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });

      setLocalStream(stream);
      setHasCameraPermission(true);
      setErrorMsg('');

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera/Mic permission warning:', err);
      setHasCameraPermission(false);
      setErrorMsg(err.message || 'Camera or Microphone access denied. Preview mode active.');
    }
  }, []);

  useEffect(() => {
    initMediaStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Sync video ref whenever localStream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    } else {
      setIsMicOn((prev) => !prev);
    }
  };

  // Toggle Camera
  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
      }
    } else {
      setIsCamOn((prev) => !prev);
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera stream
      initMediaStream();
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        setLocalStream(screenStream);
        setIsScreenSharing(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Listen for screen share stop event
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          initMediaStream();
        };
      } catch (err) {
        console.warn('Screen share canceled or failed:', err);
      }
    }
  };

  return {
    localStream,
    localVideoRef,
    isMicOn,
    isCamOn,
    isScreenSharing,
    hasCameraPermission,
    errorMsg,
    toggleMic,
    toggleCam,
    toggleScreenShare,
    retryMedia: initMediaStream
  };
};
