import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import PostDetail from "./pages/PostDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Directory from "./pages/Directory";
import Docs from "./pages/Docs";
import Console from "./pages/Console";

export default function App() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/directory" element={<Directory />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/console" element={<Console />} />
      </Routes>
    </div>
  );
}
