import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DisplayProvider } from "@/context/DisplayContext";
import { AuthProvider } from "@/context/AuthContext";
import DisplayPage from "./pages/DisplayPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <AuthProvider>
    <DisplayProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DisplayPage />} />
          <Route path="/display" element={<DisplayPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DisplayProvider>
  </AuthProvider>
);

export default App;
