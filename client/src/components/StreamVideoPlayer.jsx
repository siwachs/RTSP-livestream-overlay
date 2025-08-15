import PropTypes from "prop-types";
import { useRef, useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Pause,
  Play,
  VolumeX,
  Volume2,
} from "lucide-react";

const StreamVideoPlayer = ({ rtspUrl, overlays, onOverlayUpdate }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [draggedOverlay, setDraggedOverlay] = useState(null);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Video controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const getPlayableUrl = (rtspUrl) => {
    if (rtspUrl.includes("sample") || rtspUrl.includes("demo")) {
      return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    }
    return rtspUrl;
  };

  // Video control functions
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // Overlay drag functions
  const handleOverlayMouseDown = (e, overlay) => {
    e.preventDefault();
    e.stopPropagation();

    const overlayRect = e.currentTarget.getBoundingClientRect();

    setDragOffset({
      x: e.clientX - overlayRect.left,
      y: e.clientY - overlayRect.top,
    });

    setIsDragging(true);
    setDraggedOverlay(overlay);
    setSelectedOverlay(overlay);
  };

  useEffect(() => {
    if (!isDragging || !draggedOverlay) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100;
      const y = ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100;

      const updatedOverlay = {
        ...draggedOverlay,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };

      onOverlayUpdate(draggedOverlay._id, updatedOverlay);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedOverlay(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, draggedOverlay, dragOffset, onOverlayUpdate]);

  const renderOverlay = (overlay) => {
    const style = {
      position: "absolute",
      left: `${overlay.x}%`,
      top: `${overlay.y}%`,
      width: `${overlay.width}px`,
      height: `${overlay.height}px`,
      fontSize: `${overlay.fontSize}px`,
      color: overlay.color,
      backgroundColor: overlay.backgroundColor,
      borderRadius: `${overlay.borderRadius}px`,
      opacity: overlay.opacity,
      transform: `rotate(${overlay.rotation}deg)`,
      zIndex: overlay.zIndex,
      cursor: "move",
      display: overlay.isVisible ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      padding: "8px",
      border:
        selectedOverlay?._id === overlay._id
          ? "2px solid #3b82f6"
          : "1px solid rgba(255,255,255,0.3)",
      boxSizing: "border-box",
    };

    return (
      <div
        role="button"
        tabIndex={0}
        key={overlay._id}
        style={style}
        onMouseDown={(e) => handleOverlayMouseDown(e, overlay)}
        className="overlay-element select-none"
      >
        {overlay.type === "text" && (
          <span className="text-center break-words">{overlay.content}</span>
        )}
        {overlay.type === "image" && (
          <img
            src={overlay.content}
            alt="Overlay"
            className="w-full h-full object-contain"
          />
        )}
        {overlay.type === "logo" && (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={overlay.fontSize} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative aspect-video">
      <div
        role="button"
        tabIndex={0}
        ref={containerRef}
        className="relative w-full h-full bg-black rounded-lg overflow-hidden"
        onClick={() => setSelectedOverlay(null)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSelectedOverlay(null);
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onPlay={() => {
            setIsPlaying(true);
            onPlayStateChange(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            onPlayStateChange(false);
          }}
          src={getPlayableUrl(rtspUrl)}
        />

        {/* Overlays */}
        {overlays.map(renderOverlay)}

        {/* Stream Controls */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-lg">
            <button
              onClick={handlePlayPause}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-blue-500"
              />

              <span className="text-sm w-8">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Overlay selection indicator */}
        {selectedOverlay && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
            Selected: {selectedOverlay.type} -{" "}
            {selectedOverlay.content.substring(0, 20)}...
          </div>
        )}
      </div>
    </div>
  );
};

StreamVideoPlayer.propTypes = {
  rtspUrl: PropTypes.string.isRequired,
  overlays: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      content: PropTypes.string,
      x: PropTypes.number,
      y: PropTypes.number,
      width: PropTypes.number,
      height: PropTypes.number,
      fontSize: PropTypes.number,
      color: PropTypes.string,
      backgroundColor: PropTypes.string,
      borderRadius: PropTypes.number,
      opacity: PropTypes.number,
      rotation: PropTypes.number,
      zIndex: PropTypes.number,
      isVisible: PropTypes.bool,
    })
  ).isRequired,
  onOverlayUpdate: PropTypes.func.isRequired,
  onPlayStateChange: PropTypes.func.isRequired,
};

export default StreamVideoPlayer;
