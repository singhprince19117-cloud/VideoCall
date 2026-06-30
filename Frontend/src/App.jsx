import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing";
import "./App.css"
import Authentication from "./pages/authentication";
import VideoMeet from "./pages/VideoMeet";
import Home from "./pages/home";
import History from "./pages/history";

function App() {
  return (

    <>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/auth' element={<Authentication />} />
        <Route path='/home' element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path='/:url' element={<VideoMeet />} />
      </Routes>
    </>
  );
}

export default App;