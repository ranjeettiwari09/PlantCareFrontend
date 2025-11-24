import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Leaf, Calendar, TrendingUp, Droplet, Sun } from "lucide-react";
import { AuthContext } from "../../Context/authContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../config/api";

const PlantTracker = () => {
  const { token, isLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogin) {
      toast.error("Please login to track your plants");
      navigate("/login");
      return;
    }
    fetchPlants();
  }, [isLogin, token]);

  const fetchPlants = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/plants/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlants(res.data.plants || []);
    } catch (error) {
      console.error("Error fetching plants:", error);
      toast.error("Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysTracked = (plant) => {
    return plant.dailyEntries?.length || 0;
  };

  const getLastEntryDate = (plant) => {
    if (!plant.dailyEntries || plant.dailyEntries.length === 0) {
      return "No entries yet";
    }
    const lastEntry = plant.dailyEntries.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];
    return new Date(lastEntry.date).toLocaleDateString();
  };

  const getHealthColor = (status) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "good":
        return "bg-blue-500";
      case "fair":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your plants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <Leaf className="w-12 h-12 text-green-600" />
            Plant Tracker
          </h1>
          <p className="text-xl text-gray-600">
            Track your plants' growth and get AI-powered care recommendations
          </p>
        </motion.div>

        {/* Add Plant Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex justify-center"
        >
          <button
            onClick={() => navigate("/tracker/add")}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold text-lg"
          >
            <Plus className="w-6 h-6" />
            Add New Plant
          </button>
        </motion.div>

        {/* Plants Grid */}
        {plants.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant, index) => (
              <motion.div
                key={plant._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/tracker/plant/${plant._id}`)}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105"
              >
                {/* Plant Image */}
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600">
                  {plant.image ? (
                    <img
                      src={plant.image}
                      alt={plant.plantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`w-4 h-4 rounded-full ${getHealthColor(
                        plant.dailyEntries?.[0]?.healthStatus || "good"
                      )} shadow-lg`}
                      title={
                        plant.dailyEntries?.[0]?.healthStatus || "good"
                      }
                    ></div>
                  </div>
                </div>

                {/* Plant Info */}
                <div className="p-5">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {plant.plantName}
                  </h3>
                  <p className="text-gray-600 mb-4">{plant.plantType}</p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Days tracked: {calculateDaysTracked(plant)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>Last entry: {getLastEntryDate(plant)}</span>
                    </div>
                    {plant.dailyEntries?.[0] && (
                      <>
                        {plant.dailyEntries[0].watered && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Droplet className="w-4 h-4" />
                            <span>Watered today</span>
                          </div>
                        )}
                        {plant.dailyEntries[0].sunlightHours > 0 && (
                          <div className="flex items-center gap-2 text-sm text-yellow-600">
                            <Sun className="w-4 h-4" />
                            <span>
                              {plant.dailyEntries[0].sunlightHours} hrs sunlight
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-2 rounded-lg font-semibold transition-all duration-200">
                    View Details & Progress
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
          >
            <Leaf className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No plants tracked yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start tracking your plants to see their progress and get AI
              recommendations!
            </p>
            <button
              onClick={() => navigate("/tracker/add")}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold mx-auto"
            >
              <Plus className="w-5 h-5" />
              Add Your First Plant
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PlantTracker;

