import Navbar from "./Components/MainPages/Navbar";
import Login from "./Components/RegularPage/Login";
import Signup from "./Components/RegularPage/Signup";
import { Routes, Route } from "react-router-dom";
import Profile from "./Components/RegularPage/Profile";
import Home from "./Components/MainPages/Home";
import Post from "./Components/RegularPage/Post";
import SinglePost from "./Components/RegularPage/SinglePost"; 
import { AuthProvider } from "./Context/authContext";
import PasswordChange from "./Components/RegularPage/PasswordChange";
import Chat from "./Components/RegularPage/Chat";
import UserProfile from "./Components/RegularPage/UserProfile";
import MyPost from "./Components/RegularPage/MyPost";
import PlantCareTips from "./Components/RegularPage/PlantCareTips";
import FollowList from "./Components/RegularPage/FollowList";
import PlantTracker from "./Components/RegularPage/PlantTracker";
import AddPlant from "./Components/RegularPage/AddPlant";
import PlantDetail from "./Components/RegularPage/PlantDetail";
function App() {
  return (
    <>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/post" element={<Post/>} />
          <Route path="/post/:id" element={<SinglePost />} />
          <Route path="/changepassword" element={<PasswordChange />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/user/:email" element={<UserProfile />} />
          <Route path="/my-post" element={<MyPost />} />
          <Route path="/plant-care-tips" element={<PlantCareTips />} />
          <Route path="/user/:email/:type" element={<FollowList />} />
          <Route path="/tracker" element={<PlantTracker />} />
          <Route path="/tracker/add" element={<AddPlant />} />
          <Route path="/tracker/plant/:id" element={<PlantDetail />} />


        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
