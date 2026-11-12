import { Route, Routes } from "react-router-dom";
import { Layout, ProtectedRoute, ScrollToTop } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { JobBoard } from "./pages/JobBoard";
import { JobDetail } from "./pages/JobDetail";
import { Artisans } from "./pages/Artisans";
import { ArtisanProfilePage } from "./pages/ArtisanProfile";
import { PostJob } from "./pages/PostJob";
import { Login } from "./pages/Login";
import { Join } from "./pages/Join";
import { Dashboard } from "./pages/Dashboard";
import { Contracts } from "./pages/Contracts";
import { ContractRoom } from "./pages/ContractRoom";
import { Messages } from "./pages/Messages";
import { Treasury } from "./pages/Treasury";
import { Settings } from "./pages/Settings";
import { Oracle } from "./pages/Oracle";
import { Oath } from "./pages/Oath";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/artisans" element={<Artisans />} />
          <Route path="/artisans/:handle" element={<ArtisanProfilePage />} />
          <Route path="/counsel" element={<Oracle />} />
          <Route path="/oath" element={<Oath />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/post" element={<PostJob />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/:id" element={<ContractRoom />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/treasury" element={<Treasury />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
