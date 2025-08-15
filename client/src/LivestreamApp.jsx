import { useEffect, useState } from "react";

import useOverlays from "./hooks/useOverlays";
import apiService from "./services/apiService";

import Analytics from "./components/Analytics";
import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import StreamVideoPlayer from "./components/StreamVideoPlayer";
import OverlayPanel from "./components/OverlayPanel";
import OverlayForm from "./components/OverlayForm";
import {
  Play,
  Monitor,
  Layers,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Type,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Activity,
} from "lucide-react";

function LivestreamApp() {
  const [currentView, setCurrentView] = useState("landing");
  const [rtspUrl, setRtspUrl] = useState("");
  const [validatingStream, setValidatingStream] = useState(false);
  const [streamValid, setStreamValid] = useState(null);
  const [showOverlayForm, setShowOverlayForm] = useState(false);
  const [editingOverlay, setEditingOverlay] = useState(null);
  const [toast, setToast] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const {
    overlays,
    loading: overlaysLoading,
    // error: overlaysError,
    fetchOverlays,
    createOverlay,
    updateOverlay,
    deleteOverlay,
  } = useOverlays();

  // Sample RTSP URLs for demo
  const sampleRtspUrls = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "rtsp://210.61.216.66:554/live.sdp",
  ];

  useEffect(() => {
    fetchOverlays();
    fetchAnalytics();
  }, [fetchOverlays]);

  const fetchAnalytics = async () => {
    try {
      const data = await apiService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const validateStream = async () => {
    if (!rtspUrl.trim()) {
      showToast("Please enter a valid RTSP URL", "error");
      return;
    }

    setValidatingStream(true);
    try {
      const result = await apiService.validateStream(rtspUrl);
      setStreamValid(result.valid);
      if (result.valid) {
        showToast("Stream validated successfully!", "success");
        setCurrentView("stream");
      } else {
        showToast(result.message || "Invalid stream URL", "error");
      }
    } catch (error) {
      console.error("Stream validation error:", error);
      showToast("Failed to validate stream", "error");
      setStreamValid(false);
    } finally {
      setValidatingStream(false);
    }
  };

  const handleOverlaySave = async (overlayData) => {
    try {
      if (editingOverlay) {
        await updateOverlay(editingOverlay._id, overlayData);
        showToast("Overlay updated successfully!", "success");
      } else {
        await createOverlay(overlayData);
        showToast("Overlay created successfully!", "success");
      }
      setShowOverlayForm(false);
      setEditingOverlay(null);
    } catch (error) {
      console.error("Error saving overlay:", error);
      showToast("Failed to save overlay", "error");
    }
  };

  const handleOverlayEdit = (overlay) => {
    setEditingOverlay(overlay);
    setShowOverlayForm(true);
  };

  const handleOverlayDelete = async (overlayId) => {
    try {
      await deleteOverlay(overlayId);
      showToast("Overlay deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting overlay:", error);
      showToast("Failed to delete overlay", "error");
    }
  };

  const handleOverlayToggleVisibility = async (overlayId, visible) => {
    try {
      await updateOverlay(overlayId, { isVisible: visible });
      showToast(`Overlay ${visible ? "shown" : "hidden"}`, "success");
    } catch (error) {
      console.error("Error updating overlay visibility:", error);
      showToast("Failed to update overlay visibility", "error");
    }
  };

  if (currentView === "landing")
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              RTSP Livestream Overlay
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Create stunning livestreams with real-time overlays, analytics,
              and dynamic content. Perfect for gaming, events, and professional
              broadcasts.
            </p>
          </div>

          {/* Analytics Overview */}
          {analytics && <Analytics analytics={analytics} />}

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {/* Stream Setup Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-white/20">
              <h2 className="text-3xl font-semibold text-white mb-8 text-center flex items-center justify-center gap-3">
                <Monitor size={32} />
                Start Your Livestream
              </h2>

              <div className="space-y-6">
                {/* RTSP URL Input */}
                <div>
                  <label className="block text-white font-medium mb-3">
                    RTSP Stream URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={rtspUrl}
                      onChange={(e) => setRtspUrl(e.target.value)}
                      placeholder="rtsp://your-stream-server.com:554/stream"
                      className="w-full p-4 pr-12 bg-white/20 border border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                    {streamValid === true && (
                      <CheckCircle
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400"
                        size={20}
                      />
                    )}
                    {streamValid === false && (
                      <AlertCircle
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-400"
                        size={20}
                      />
                    )}
                  </div>
                </div>

                {/* Sample URLs */}
                <div>
                  <p className="text-gray-300 text-sm mb-3">
                    Or try these sample streams:
                  </p>
                  <div className="grid gap-2">
                    {sampleRtspUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setRtspUrl(url)}
                        className="text-left p-3 bg-white/10 rounded-lg text-blue-300 hover:bg-white/20 transition-colors text-sm"
                      >
                        {url}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={validateStream}
                  disabled={validatingStream || !rtspUrl.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  {validatingStream ? (
                    <>
                      <LoadingSpinner size="small" />
                      Validating Stream...
                    </>
                  ) : (
                    <>
                      <Play size={24} />
                      Start Streaming
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor size={32} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  RTSP Streaming
                </h3>
                <p className="text-gray-300">
                  Support for RTSP, RTMP, and HLS streams with real-time
                  playback
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers size={32} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Dynamic Overlays
                </h3>
                <p className="text-gray-300">
                  Add custom text, images, and logos with drag-and-drop
                  positioning
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={32} className="text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Analytics
                </h3>
                <p className="text-gray-300">
                  Track overlay performance and stream statistics in real-time
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            {analytics?.recentActivity && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  Recent Activity
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">
                      Latest Overlays
                    </h4>
                    <div className="space-y-3">
                      {analytics.recentActivity.overlays
                        .slice(0, 3)
                        .map((overlay) => (
                          <div
                            key={overlay._id}
                            className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              {overlay.type === "text" && (
                                <Type size={16} className="text-blue-400" />
                              )}
                              {overlay.type === "image" && (
                                <ImageIcon
                                  size={16}
                                  className="text-green-400"
                                />
                              )}
                              {overlay.type === "logo" && (
                                <Layers size={16} className="text-purple-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {overlay.content.substring(0, 30)}...
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(
                                  overlay.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-4">
                      Stream History
                    </h4>
                    <div className="space-y-3">
                      {analytics.recentActivity.streams
                        .slice(0, 3)
                        .map((stream) => (
                          <div
                            key={stream._id}
                            className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                              <Activity size={16} className="text-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                Stream {stream.streamId}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(
                                  stream.startTime
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );

  if (currentView === "stream")
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentView("landing")}
                  className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                >
                  ← Back to Home
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  Live Stream
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Status:{" "}
                  <span className="text-green-600 font-medium">● Live</span>
                </div>
                <button
                  onClick={() => {
                    setEditingOverlay(null);
                    setShowOverlayForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Overlay
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <StreamVideoPlayer
                  rtspUrl={rtspUrl}
                  overlays={overlays.filter((o) => o.isVisible)}
                  onOverlayUpdate={updateOverlay}
                />

                {/* Stream Info */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Stream URL: {rtspUrl}</span>
                    <div className="flex items-center gap-4">
                      <span>Resolution: 1920×1080</span>
                      <span>Bitrate: 2.5 Mbps</span>
                      <span>FPS: 30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Overlay Management */}
              <OverlayPanel
                overlays={overlays}
                onEdit={handleOverlayEdit}
                onDelete={handleOverlayDelete}
                onToggleVisibility={handleOverlayToggleVisibility}
              />

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw size={16} />
                    Refresh Stream
                  </button>

                  <button
                    onClick={() => {
                      const config = {
                        overlays,
                        rtspUrl,
                        // settings: { volume, isMuted },
                      };
                      const blob = new Blob([JSON.stringify(config, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "stream-config.json";
                      a.click();
                    }}
                    className="w-full flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                    Export Config
                  </button>

                  <label className="w-full flex items-center gap-2 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Upload size={16} />
                    Import Config
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const config = JSON.parse(e.target.result);
                              console.log("Imported config:", config);
                              showToast(
                                "Configuration imported successfully!",
                                "success"
                              );
                            } catch (error) {
                              console.error("Invalid config file:", error);
                              showToast("Invalid configuration file", "error");
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Stream Statistics */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime</span>
                    <span className="font-medium">2h 34m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Viewers</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peak Viewers</span>
                    <span className="font-medium">203</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Sent</span>
                    <span className="font-medium">4.2 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Overlays</span>
                    <span className="font-medium">
                      {overlays.filter((o) => o.isVisible).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Form Modal */}
        {showOverlayForm && (
          <OverlayForm
            overlay={editingOverlay}
            onSave={handleOverlaySave}
            onCancel={() => {
              setShowOverlayForm(false);
              setEditingOverlay(null);
            }}
          />
        )}

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Loading Overlay */}
        {overlaysLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-4">
              <LoadingSpinner />
              <span>Loading overlays...</span>
            </div>
          </div>
        )}
      </div>
    );

  return null;
}

export default LivestreamApp;
