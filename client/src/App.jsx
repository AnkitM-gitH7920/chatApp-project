import Home from "./components/Home/Home";
import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup/Signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/auth/signup" element={<Signup />}></Route>
    </Routes>
  )
}

export default App;