import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Leaf, Users, ClipboardList, Phone } from "lucide-react";

const baseUrl="https://plantcarebackend.onrender.com"
const Home = () => {
  const [user, setUser] = useState();
  const [token] = useState(localStorage.getItem("token"));
  const [content, setContent] = useState({
    about: null,
    facilities: [],
    contact: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${baseUrl}/auth/getuser/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setUser(null);
      }
    };

    const dummyContent = {
      about: {
        intro: `PlantConnect is a community-driven platform that connects plant lovers. 
Share your plant care journey, track your green friends’ growth, 
and get inspired by nature enthusiasts worldwide.`,
      },
      facilities: [
        {
          icon: <Leaf className="w-10 h-10 text-green-600 mx-auto mb-3" />,
          name: "Personalized Plant Care",
          description:
            "Track watering, fertilization, and growth logs tailored to your plants.",
        },
        {
          icon: <Users className="w-10 h-10 text-green-600 mx-auto mb-3" />,
          name: "Community Interaction",
          description:
            "Engage with other plant lovers, share stories, and learn together.",
        },
        {
          icon: (
            <ClipboardList className="w-10 h-10 text-green-600 mx-auto mb-3" />
          ),
          name: "Organized Tracking",
          description:
            "Stay on top of schedules with reminders, dashboards, and progress updates.",
        },
      ],
      contact: {
        helpdesk: [
          {
            location: "Main Support Office",
            phone: "+91-98765-43210",
            email: "support@plantconnect.org",
          },
          {
            location: "Community Helpdesk",
            phone: "+91-91234-56789",
            email: "community@plantconnect.org",
          },
        ],
      },
    };

    if (token) fetchUser();
    setContent(dummyContent);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-green-700 text-white shadow-md p-6 flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide">
          🌱 Plant Connect
        </h1>
        <div className="text-md italic">
          Welcome, <span className="font-semibold">{user?.name || "Guest"}</span>
        </div>  
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-16 px-6 space-y-20">
        {/* About */}
        <motion.section
          id="about"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-green-700 mb-6">
            About PlantConnect
          </h2>
          <p className="whitespace-pre-line text-lg leading-8 tracking-wide max-w-3xl mx-auto">
            {content.about?.intro}
          </p>
        </motion.section>

        {/* Facilities */}
        <motion.section
          id="facilities"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-3xl font-semibold text-green-700 mb-8 text-center">
            Features & Facilities
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {content.facilities.map((facility, idx) => (
              <motion.div
                key={idx}
                className="bg-white shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-200"
                whileHover={{ scale: 1.05 }}
              >
                {facility.icon}
                <h3 className="text-xl font-semibold mb-2">{facility.name}</h3>
                <p className="text-gray-600">{facility.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          id="contact"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-green-700 mb-8 text-center">
            Contact & Helpdesk
          </h2>
          <ul className="space-y-6 max-w-3xl mx-auto">
            {content.contact?.helpdesk?.map((contact, idx) => (
              <li
                key={idx}
                className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500"
              >
                <p className="text-lg font-semibold mb-1">
                  {contact.location}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {contact.phone}
                </p>
                <p className="text-gray-600">📧 {contact.email}</p>
              </li>
            ))}
          </ul>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="bg-green-700 text-white py-6 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} PlantConnect | Built with ❤️ using MERN
          Stack & TailwindCSS
        </p>
      </footer>
    </div>
  );
};

export default Home;
