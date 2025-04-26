import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import Contact from './pages/Contact';
import ServiceDetail from './pages/ServiceDetail';
import ServicePostEditor from './pages/ServicePostEditor';
import ServiceApply from './pages/ServiceApply';
import DemandDetail from './pages/DemandDetail';
import DemandPostEditor from './pages/DemandPostEditor';
import DemandApply from './pages/DemandApply';
import ServiceRental from './pages/ServiceRentalForm';
import ServiceRentalList from './pages/ServiceRentalList';
import ServiceRentalDetail from './pages/ServiceRentalDetail';
import Profile from './pages/Profile';
import ServiceReview from './pages/ServiceReview';
import MyDemands from './pages/MyDemands';
import ApprovedDemands from './pages/ApprovedDemands';
import Demands from './pages/Demands';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/create" element={<ServicePostEditor />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/:id/edit" element={<ServicePostEditor />} />
            <Route path="/services/:id/apply" element={<ServiceApply />} />
            <Route path="/services/:serviceId/rent" element={<ServiceRental />} />
            <Route path="/service-rentals" element={<ServiceRentalList />} />
            <Route path="/service-rentals/:rentalId" element={<ServiceRentalDetail />} />
            <Route path="/service-rentals/:rentalId/review" element={<ServiceReview />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/demands" element={<Demands />} />
            <Route path="/demands/new" element={<DemandPostEditor />} />
            <Route path="/demands/:id" element={<DemandDetail />} />
            <Route path="/demands/:id/edit" element={<DemandPostEditor />} />
            <Route path="/demands/:id/apply" element={<DemandApply />} />
            <Route path="/my-demands" element={<MyDemands />} />
            <Route path="/demands/approved" element={<ApprovedDemands />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
