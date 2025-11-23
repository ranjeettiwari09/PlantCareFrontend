import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatSection from "./ChatSection";
import PlantCareChatbot from "./PlantCareChatbot";
import { MessageCircle, Keyboard } from "lucide-react";

const PlantCareTips = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const tipsCategories = [
    {
      title: "💧 Watering Essentials",
      icon: "💧",
      tips: [
        {
          title: "Check Soil Before Watering",
          description: "Insert your finger 1-2 inches into the soil. If it's dry, water your plant. Avoid overwatering!"
        },
        {
          title: "Water at the Right Time",
          description: "Early morning is the best time to water plants as it allows for proper absorption throughout the day."
        },
        {
          title: "Use Room Temperature Water",
          description: "Cold water can shock plant roots. Let tap water sit for 24 hours to allow chlorine to evaporate."
        },
        {
          title: "Bottom Watering Method",
          description: "Place pots in a tray of water for 15-30 minutes. This encourages deep root growth and prevents overwatering."
        }
      ]
    },
    {
      title: "☀️ Light Requirements",
      icon: "☀️",
      tips: [
        {
          title: "Know Your Plant's Needs",
          description: "Some plants love bright direct sun, others prefer indirect light. Read plant labels or research online."
        },
        {
          title: "Rotate Your Plants",
          description: "Rotate pots weekly to ensure all sides receive even light and prevent lopsided growth."
        },
        {
          title: "Use a Light Meter",
          description: "Download a free light meter app to check if your plant location gets the right amount of light."
        },
        {
          title: "Supplement with Grow Lights",
          description: "If natural light is insufficient, use LED grow lights for 12-16 hours daily."
        }
      ]
    },
    {
      title: "🌿 Fertilizing Tips",
      icon: "🌿",
      tips: [
        {
          title: "Fertilize During Growing Season",
          description: "Feed plants during spring and summer when they're actively growing. Reduce or stop in fall/winter."
        },
        {
          title: "Dilute Fertilizer Properly",
          description: "Always follow package instructions and dilute fertilizer to half-strength for indoor plants."
        },
        {
          title: "Use Organic Options",
          description: "Consider organic fertilizers like compost tea, fish emulsion, or worm castings for healthier growth."
        },
        {
          title: "Fertilize Before Watering",
          description: "Water the plant first, then apply fertilizer to prevent root burn."
        }
      ]
    },
    {
      title: "🌱 Soil & Potting",
      icon: "🌱",
      tips: [
        {
          title: "Choose the Right Pot Size",
          description: "Select a pot that's 1-2 inches larger than the current one. Too large pots can cause overwatering."
        },
        {
          title: "Ensure Proper Drainage",
          description: "Always use pots with drainage holes. Add a layer of gravel at the bottom for extra drainage."
        },
        {
          title: "Use Quality Potting Mix",
          description: "Invest in well-draining potting soil mixed with perlite or vermiculite for better aeration."
        },
        {
          title: "Refresh Soil Annually",
          description: "Replace the top 1-2 inches of soil every year to replenish nutrients."
        }
      ]
    },
    {
      title: "🌡️ Temperature & Humidity",
      icon: "🌡️",
      tips: [
        {
          title: "Maintain Consistent Temperature",
          description: "Most houseplants thrive at 65-75°F. Keep away from drafts, heaters, and air conditioners."
        },
        {
          title: "Increase Humidity for Tropical Plants",
          description: "Use humidifiers, pebble trays with water, or group plants together to increase humidity."
        },
        {
          title: "Mist Leaves Regularly",
          description: "Spray plants with water 2-3 times a week to increase humidity and clean leaves."
        },
        {
          title: "Monitor Seasonal Changes",
          description: "Adjust care routines seasonally. Plants need less water in winter and more in summer."
        }
      ]
    },
    {
      title: "🐛 Pest & Disease Prevention",
      icon: "🐛",
      tips: [
        {
          title: "Inspect Plants Regularly",
          description: "Check under leaves and stems weekly for pests like aphids, spider mites, or mealybugs."
        },
        {
          title: "Quarantine New Plants",
          description: "Keep new plants separate for 2 weeks to ensure they're pest-free before introducing them."
        },
        {
          title: "Use Natural Pest Remedies",
          description: "Try neem oil, insecticidal soap, or a mixture of water and dish soap to treat pests."
        },
        {
          title: "Improve Air Circulation",
          description: "Good air flow prevents fungal diseases. Use a small fan or open windows periodically."
        }
      ]
    },
    {
      title: "✂️ Pruning & Maintenance",
      icon: "✂️",
      tips: [
        {
          title: "Remove Dead Leaves",
          description: "Trim yellow or brown leaves promptly to prevent disease spread and improve appearance."
        },
        {
          title: "Pinch Tips for Bushier Growth",
          description: "Pinch off growing tips to encourage branching and create a fuller plant."
        },
        {
          title: "Clean Leaves Monthly",
          description: "Wipe leaves with a damp cloth to remove dust, allowing better photosynthesis."
        },
        {
          title: "Prune During Active Growth",
          description: "Best time to prune is in spring or early summer when plants can recover quickly."
        }
      ]
    },
    {
      title: "💡 General Tips & Tricks",
      icon: "💡",
      tips: [
        {
          title: "Start with Easy Plants",
          description: "Begin with low-maintenance plants like pothos, snake plants, or succulents to build confidence."
        },
        {
          title: "Keep a Plant Journal",
          description: "Track watering schedules, growth progress, and any issues to learn what works best."
        },
        {
          title: "Research Before You Buy",
          description: "Understand a plant's specific needs before purchasing to ensure you can provide proper care."
        },
        {
          title: "Don't Overreact to Minor Issues",
          description: "Some leaf drop or yellowing is normal. Research before taking drastic measures."
        },
        {
          title: "Be Patient",
          description: "Plants grow slowly. Give them time to adjust to new environments and care routines."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4 relative">
      {/* Toggleable Chatbot Sidebar - Animates from button position */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ 
              scale: 0.1,
              opacity: 0,
              x: 0,
              y: 0
            }}
            animate={{ 
              scale: 1,
              opacity: 1,
              x: 0,
              y: 0
            }}
            exit={{ 
              scale: 0.1,
              opacity: 0,
              x: 0,
              y: 0
            }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 300,
              duration: 0.5
            }}
            className="fixed right-8 top-20 bottom-8 w-[calc(100vw-4rem)] max-w-md z-30 hidden lg:block"
            style={{
              transformOrigin: 'bottom right'
            }}
          >
            <PlantCareChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} isAlwaysVisible={true} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content - No margin needed as chatbot overlays */}
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌿 Plant Care Tips & Tricks
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover expert methods to keep your plants healthy and thriving. 
            Follow these proven tips for successful plant care!
          </p>
        </motion.div>
        </div>

        {/* Tips Grid */}
        <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tipsCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-green-200">
                <span className="text-4xl">{category.icon}</span>
                <h2 className="text-2xl font-bold text-gray-800">{category.title}</h2>
              </div>

              {/* Tips List */}
              <div className="space-y-4">
                {category.tips.map((tip, tipIndex) => (
                  <motion.div
                    key={tipIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: categoryIndex * 0.1 + tipIndex * 0.05 }}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 hover:from-green-50 hover:to-green-100 transition-all duration-300 border-l-4 border-green-500"
                  >
                    <h3 className="font-bold text-gray-800 mb-2 flex items-start gap-2">
                      <span className="text-green-600 text-lg">✓</span>
                      {tip.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed ml-6">
                      {tip.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        </div>

        {/* Chat Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            💬 Chat with Plant Lovers
          </h2>
          <p className="text-gray-600">
            Connect with other plant enthusiasts and share your plant care experiences!
          </p>
        </div>
          <ChatSection />
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-center shadow-xl"
        >
        <p className="text-white text-xl font-semibold mb-2">
          "The best time to plant a tree was 20 years ago. The second best time is now."
        </p>
          <p className="text-green-100 text-sm">— Chinese Proverb</p>
        </motion.div>
      </div>

      {/* Chat Button - Toggle Chatbot (Visible on all screens) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label={isChatbotOpen ? "Close Plant Care Chatbot" : "Open Plant Care Chatbot"}
      >
        <motion.div
          animate={{ rotate: isChatbotOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <MessageCircle className="w-7 h-7" />
        </motion.div>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          <Keyboard className="w-4 h-4" />
        </span>
        <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isChatbotOpen ? "Hide" : "Show"} AI Chatbot
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </motion.button>

      {/* Mobile Chatbot Modal - Only show when open */}
      {isChatbotOpen && (
        <div className="lg:hidden">
          <PlantCareChatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default PlantCareTips;


