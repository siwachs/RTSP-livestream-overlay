import PropTypes from "prop-types";

import { Layers, Eye, Monitor, Activity } from "lucide-react";

const Analytics = ({ analytics }) => {
  if (!analytics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Overlays</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.summary.totalOverlays}
            </p>
          </div>
          <Layers className="h-8 w-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Overlays</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.summary.activeOverlays}
            </p>
          </div>
          <Eye className="h-8 w-8 text-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Streams</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.summary.totalStreams}
            </p>
          </div>
          <Monitor className="h-8 w-8 text-purple-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Streams</p>
            <p className="text-2xl font-bold text-gray-900">
              {analytics.summary.activeStreams}
            </p>
          </div>
          <Activity className="h-8 w-8 text-red-500" />
        </div>
      </div>
    </div>
  );
};

Analytics.propTypes = {
  analytics: PropTypes.shape({
    summary: PropTypes.shape({
      totalOverlays: PropTypes.number.isRequired,
      activeOverlays: PropTypes.number.isRequired,
      totalStreams: PropTypes.number.isRequired,
      activeStreams: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Analytics;
