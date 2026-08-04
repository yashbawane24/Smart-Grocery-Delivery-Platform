import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/home/Home";

function App() {
  return (
    <div className="min-h-screen bg-surface font-body text-dark">
      <Toaster />
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
