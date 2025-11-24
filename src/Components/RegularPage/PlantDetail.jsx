import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Droplet,
  Sun,
  Thermometer,
  Wind,
  FileText,
  Sparkles,
  Plus,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { AuthContext } from "../../Context/authContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../config/api";

const PlantDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryData, setEntryData] = useState({
    watered: false,
    fertilized: false,
    sunlightHours: 0,
    temperature: null,
    humidity: null,
    notes: "",
    healthStatus: "good",
    growthNotes: "",
  });

  useEffect(() => {
    fetchPlant();
  }, [id]);

  const fetchPlant = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/plants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlant(res.data.plant);
    } catch (error) {
      console.error("Error fetching plant:", error);
      toast.error("Failed to load plant details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/plants/${id}/recommendations`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecommendations(res.data.recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Failed to get AI recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/plants/${id}/entry`,
        entryData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Daily entry added successfully!");
      setShowAddEntry(false);
      setEntryData({
        watered: false,
        fertilized: false,
        sunlightHours: 0,
        temperature: null,
        humidity: null,
        notes: "",
        healthStatus: "good",
        growthNotes: "",
      });
      fetchPlant();
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry");
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case "excellent":
        return "bg-green-500 text-white";
      case "good":
        return "bg-blue-500 text-white";
      case "fair":
        return "bg-yellow-500 text-white";
      case "poor":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const calculateStats = () => {
    if (!plant || !plant.dailyEntries || plant.dailyEntries.length === 0) {
      return {
        totalDays: 0,
        avgSunlight: 0,
        wateringDays: 0,
        fertilizingDays: 0,
        avgHealth: "good",
      };
    }

    const entries = plant.dailyEntries;
    const totalDays = entries.length;
    const avgSunlight =
      entries.reduce((sum, e) => sum + (e.sunlightHours || 0), 0) / totalDays;
    const wateringDays = entries.filter((e) => e.watered).length;
    const fertilizingDays = entries.filter((e) => e.fertilized).length;

    const healthCounts = {};
    entries.forEach((e) => {
      healthCounts[e.healthStatus] = (healthCounts[e.healthStatus] || 0) + 1;
    });
    const avgHealth = Object.keys(healthCounts).reduce((a, b) =>
      healthCounts[a] > healthCounts[b] ? a : b
    );

    return {
      totalDays,
      avgSunlight: avgSunlight.toFixed(1),
      wateringDays,
      fertilizingDays,
      avgHealth,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading plant details...</p>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Plant not found</p>
          <button
            onClick={() => navigate("/tracker")}
            className="mt-4 px-6 py-3 bg-green-500 text-white rounded-xl"
          >
            Back to Tracker
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/tracker")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tracker
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Plant Info & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plant Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-start gap-6">
                {plant.image ? (
                  <img
                    src={plant.image}
                    alt={plant.plantName}
                    className="w-32 h-32 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-4xl">🌱</span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {plant.plantName}
                  </h1>
                  <p className="text-gray-600 mb-4">{plant.plantType}</p>
                  {plant.notes && (
                    <p className="text-gray-700">{plant.notes}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalDays}
                </p>
                <p className="text-sm text-gray-600">Days Tracked</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <Sun className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {stats.avgSunlight}
                </p>
                <p className="text-sm text-gray-600">Avg Sunlight (hrs)</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <Droplet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {stats.wateringDays}
                </p>
                <p className="text-sm text-gray-600">Watering Days</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {stats.avgHealth}
                </p>
                <p className="text-sm text-gray-600">Avg Health</p>
              </div>
            </motion.div>

            {/* Add Entry Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => setShowAddEntry(!showAddEntry)}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-lg"
              >
                <Plus className="w-6 h-6" />
                {showAddEntry ? "Cancel" : "Add Today's Entry"}
              </button>
            </motion.div>

            {/* Add Entry Form */}
            {showAddEntry && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddEntry}
                className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Today's Entry
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entryData.watered}
                      onChange={(e) =>
                        setEntryData({ ...entryData, watered: e.target.checked })
                      }
                      className="w-5 h-5"
                    />
                    <Droplet className="w-5 h-5 text-blue-600" />
                    <span>Watered</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={entryData.fertilized}
                      onChange={(e) =>
                        setEntryData({
                          ...entryData,
                          fertilized: e.target.checked,
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span>Fertilized</span>
                  </label>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Sunlight Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={entryData.sunlightHours}
                    onChange={(e) =>
                      setEntryData({
                        ...entryData,
                        sunlightHours: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={entryData.temperature || ""}
                      onChange={(e) =>
                        setEntryData({
                          ...entryData,
                          temperature: parseFloat(e.target.value) || null,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={entryData.humidity || ""}
                      onChange={(e) =>
                        setEntryData({
                          ...entryData,
                          humidity: parseFloat(e.target.value) || null,
                        })
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Health Status
                  </label>
                  <select
                    value={entryData.healthStatus}
                    onChange={(e) =>
                      setEntryData({ ...entryData, healthStatus: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={entryData.notes}
                    onChange={(e) =>
                      setEntryData({ ...entryData, notes: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                    placeholder="Any observations or notes..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Growth Notes
                  </label>
                  <textarea
                    value={entryData.growthNotes}
                    onChange={(e) =>
                      setEntryData({ ...entryData, growthNotes: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl"
                    placeholder="Notes about growth, new leaves, etc..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  Save Entry
                </button>
              </motion.form>
            )}

            {/* Progress History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Progress History
              </h2>
              {plant.dailyEntries && plant.dailyEntries.length > 0 ? (
                <div className="space-y-4">
                  {plant.dailyEntries
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((entry, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50 rounded-r-xl"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-800">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthColor(
                              entry.healthStatus
                            )}`}
                          >
                            {entry.healthStatus}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {entry.watered && (
                            <span className="flex items-center gap-1 text-blue-600 text-sm">
                              <Droplet className="w-4 h-4" />
                              Watered
                            </span>
                          )}
                          {entry.fertilized && (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              Fertilized
                            </span>
                          )}
                          {entry.sunlightHours > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600 text-sm">
                              <Sun className="w-4 h-4" />
                              {entry.sunlightHours}hrs
                            </span>
                          )}
                          {entry.temperature && (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <Thermometer className="w-4 h-4" />
                              {entry.temperature}°C
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-gray-600 text-sm mb-1">
                            {entry.notes}
                          </p>
                        )}
                        {entry.growthNotes && (
                          <p className="text-green-700 text-sm font-medium">
                            Growth: {entry.growthNotes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No entries yet. Add your first entry to start tracking!
                </p>
              )}
            </motion.div>
          </div>

          {/* Right Column - AI Recommendations */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  AI Recommendations
                </h2>
              </div>

              {!recommendations ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Get personalized AI recommendations based on your plant's
                    progress
                  </p>
                  <button
                    onClick={fetchRecommendations}
                    disabled={loadingRecommendations}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {loadingRecommendations ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Getting Recommendations...
                      </span>
                    ) : (
                      "Get Recommendations"
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {recommendations}
                    </div>
                  </div>
                  <button
                    onClick={fetchRecommendations}
                    disabled={loadingRecommendations}
                    className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl font-semibold text-sm"
                  >
                    Refresh Recommendations
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;

