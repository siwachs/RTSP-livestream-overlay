import PropTypes from "prop-types";

import {
  Layers,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Type,
  Image as ImageIcon,
} from "lucide-react";

const OverlayPanel = ({ overlays, onEdit, onDelete, onToggleVisibility }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Overlays</h3>
        <span className="text-sm text-gray-500">{overlays.length} total</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {overlays.map((overlay) => (
          <div
            key={overlay._id}
            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {overlay.type === "text" && (
                    <Type size={16} className="text-blue-500" />
                  )}
                  {overlay.type === "image" && (
                    <ImageIcon size={16} className="text-green-500" />
                  )}
                  {overlay.type === "logo" && (
                    <Layers size={16} className="text-purple-500" />
                  )}
                  <span className="font-medium text-gray-800 capitalize">
                    {overlay.type}
                  </span>
                  {!overlay.isVisible && (
                    <EyeOff size={14} className="text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {overlay.content.substring(0, 40)}...
                </p>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>
                    Pos: {overlay.x.toFixed(0)}%, {overlay.y.toFixed(0)}%
                  </span>
                  <span>
                    Size: {overlay.width}×{overlay.height}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 ml-2">
                <button
                  onClick={() =>
                    onToggleVisibility(overlay._id, !overlay.isVisible)
                  }
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title={overlay.isVisible ? "Hide" : "Show"}
                >
                  {overlay.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => onEdit(overlay)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(overlay._id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {overlays.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Layers size={48} className="mx-auto mb-2 opacity-50" />
            <p>No overlays created yet</p>
            <p className="text-sm">Click "Add Overlay" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

OverlayPanel.propTypes = {
  overlays: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      content: PropTypes.string,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      isVisible: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
};

export default OverlayPanel;
