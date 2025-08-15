import PropTypes from "prop-types";

import { Pause, Play, VolumeX, Volume2 } from "lucide-react";

const StreamControls = ({
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="flex items-center gap-4 bg-gray-900/80 backdrop-blur text-white px-4 py-2 rounded-lg">
      <button
        onClick={onPlayPause}
        className="p-2 hover:bg-white/20 rounded-full transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMute}
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
          onChange={onVolumeChange}
          className="w-20 accent-blue-500"
        />

        <span className="text-sm w-8">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

StreamControls.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  volume: PropTypes.number.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  isMuted: PropTypes.bool.isRequired,
  onToggleMute: PropTypes.func.isRequired,
};

export default StreamControls;
