import PropTypes from "prop-types";
import { useState } from "react";

import LoadingSpinner from "./LoadingSpinner";

import { Save, X, Type, Image as ImageIcon, Layers } from "lucide-react";

const OverlayForm = ({ overlay, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "text",
    content: "",
    x: 50,
    y: 50,
    width: 200,
    height: 50,
    fontSize: 16,
    color: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
    opacity: 1,
    rotation: 0,
    zIndex: 1,
    animation: "none",
    isVisible: true,
    ...overlay,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {overlay ? "Edit Overlay" : "Create New Overlay"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overlay Type
              </label>
              <div className="flex gap-4">
                {["text", "image", "logo"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      className="text-blue-600"
                    />
                    <span className="capitalize flex items-center gap-1">
                      {type === "text" && <Type size={16} />}
                      {type === "image" && <ImageIcon size={16} />}
                      {type === "logo" && <Layers size={16} />}
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              {formData.type === "text" ? (
                <textarea
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Enter overlay text..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                />
              ) : (
                <input
                  type="url"
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="Enter image URL..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              )}
            </div>

            {/* Position and Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X Position (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.x}
                  onChange={(e) =>
                    handleChange("x", parseFloat(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Y Position (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.y}
                  onChange={(e) =>
                    handleChange("y", parseFloat(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.width}
                  onChange={(e) =>
                    handleChange("width", parseInt(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.height}
                  onChange={(e) =>
                    handleChange("height", parseInt(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Styling */}
            {formData.type === "text" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={formData.fontSize}
                  onChange={(e) =>
                    handleChange("fontSize", parseInt(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-full h-12 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) =>
                    handleChange("backgroundColor", e.target.value)
                  }
                  placeholder="e.g., rgba(0,0,0,0.5)"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Border Radius
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.borderRadius}
                  onChange={(e) =>
                    handleChange("borderRadius", parseInt(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.opacity}
                  onChange={(e) =>
                    handleChange("opacity", parseFloat(e.target.value))
                  }
                  className="w-full"
                />
                <span className="text-sm text-gray-500">
                  {formData.opacity}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation (deg)
                </label>
                <input
                  type="number"
                  min="-360"
                  max="360"
                  value={formData.rotation}
                  onChange={(e) =>
                    handleChange("rotation", parseInt(e.target.value))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Animation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animation
              </label>
              <select
                value={formData.animation}
                onChange={(e) => handleChange("animation", e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">None</option>
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => handleChange("isVisible", e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label className="text-sm font-medium text-gray-700">
                Visible
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="small" /> : <Save size={16} />}
                {loading ? "Saving..." : "Save Overlay"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

OverlayForm.propTypes = {
  overlay: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default OverlayForm;
