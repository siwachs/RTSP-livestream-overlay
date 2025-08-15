import { useCallback, useState } from "react";
import apiService from "../services/apiService";

const useOverlays = () => {
  const [overlays, setOverlays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOverlays = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getOverlays(params);
      setOverlays(response.overlays);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOverlay = useCallback(async (overlayData) => {
    try {
      const newOverlay = await apiService.createOverlay(overlayData);
      setOverlays((prev) => [newOverlay, ...prev]);
      return newOverlay;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateOverlay = useCallback(async (id, overlayData) => {
    try {
      const updatedOverlay = await apiService.updateOverlay(id, overlayData);
      setOverlays((prev) =>
        prev.map((o) => (o._id === id ? updatedOverlay : o))
      );
      return updatedOverlay;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteOverlay = useCallback(async (id) => {
    try {
      await apiService.deleteOverlay(id);
      setOverlays((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    overlays,
    loading,
    error,
    fetchOverlays,
    createOverlay,
    updateOverlay,
    deleteOverlay,
  };
};

export default useOverlays;
