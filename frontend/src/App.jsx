import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { PaymentModal } from './components/PaymentModal';

import { HomePage } from './pages/HomePage';
import { HotelListPage } from './pages/HotelListPage';
import { HotelDetailPage } from './pages/HotelDetailPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { MyBookingsPage } from './pages/MyBookingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { api } from './services/api';

const AppContent = () => {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState('home'); // home, hotels, hotel-detail, my-bookings, admin, login, register, confirmation
  const [loginRole, setLoginRole] = useState('user'); // 'user' or 'admin'
  const [hotels, setHotels] = useState([]);
  const [searchFilters, setSearchFilters] = useState({});
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  // Booking Flow State
  const [bookingHotel, setBookingHotel] = useState(null);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Payment Flow State
  const [pendingBooking, setPendingBooking] = useState(null);
  const [pendingPricing, setPendingPricing] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Confirmed booking for Confirmation Screen
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Fetch initial hotels for homepage
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await api.getHotels();
        if (res.success) {
          setHotels(res.hotels);
        }
      } catch (err) {
        console.error("Failed to load initial hotel list:", err);
      }
    };
    loadHotels();
  }, []);

  // Handle Search Submission from Home Page
  const handleSearch = (filters) => {
    setSearchFilters(filters);
    setView('hotels');
  };

  // View Hotel Detail
  const handleViewHotel = (hotelId) => {
    setSelectedHotelId(hotelId);
    setView('hotel-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Book from Hotel Card (auto-select first room or open detail)
  const handleQuickBook = async (hotel) => {
    try {
      const res = await api.getHotel(hotel.id);
      if (res.success && res.hotel.rooms && res.hotel.rooms.length > 0) {
        const availableRoom = res.hotel.rooms.find(r => r.availability) || res.hotel.rooms[0];
        handleSelectRoom(hotel, availableRoom);
      } else {
        handleViewHotel(hotel.id);
      }
    } catch {
      handleViewHotel(hotel.id);
    }
  };

  // Select Specific Room to book
  const handleSelectRoom = (hotel, room) => {
    if (!user) {
      alert("Please log in or register to complete your reservation.");
      setLoginRole('user');
      setView('login');
      return;
    }
    setBookingHotel(hotel);
    setBookingRoom(room);
    setShowBookingModal(true);
  };

  // Callback when user confirms booking form -> launch Payment modal
  const handleBookingDetailsReady = (createdBooking, pricing) => {
    setShowBookingModal(false);
    setPendingBooking(createdBooking);
    setPendingPricing(pricing);
    setShowPaymentModal(true);
  };

  // Callback when Payment succeeds
  const handlePaymentSuccess = (finalBooking) => {
    setShowPaymentModal(false);
    setConfirmedBooking(finalBooking);
    setView('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (targetView, role = 'user') => {
    if (targetView === 'login') {
      setLoginRole(role || 'user');
    }
    setView(targetView);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentView={view} setView={handleNavigate} />

      <main style={{ flex: 1 }}>
        {view === 'home' && (
          <HomePage 
            hotels={hotels}
            onSearch={handleSearch}
            onViewHotel={handleViewHotel}
            onQuickBook={handleQuickBook}
            setView={setView}
          />
        )}

        {view === 'hotels' && (
          <HotelListPage 
            initialFilters={searchFilters}
            onViewHotel={handleViewHotel}
            onQuickBook={handleQuickBook}
          />
        )}

        {view === 'hotel-detail' && (
          <HotelDetailPage 
            hotelId={selectedHotelId}
            onBack={() => setView('hotels')}
            onSelectRoom={handleSelectRoom}
          />
        )}

        {view === 'my-bookings' && (
          <MyBookingsPage 
            onSelectBooking={(b) => {
              setConfirmedBooking(b);
              setView('confirmation');
            }}
            onBrowseHotels={() => setView('hotels')}
          />
        )}

        {view === 'admin' && isAdmin && (
          <AdminDashboard />
        )}

        {view === 'login' && (
          <LoginPage 
            initialRole={loginRole}
            onLoginSuccess={(loggedRole) => setView(loggedRole === 'admin' ? 'admin' : 'home')}
            onGoToRegister={() => setView('register')}
          />
        )}

        {view === 'register' && (
          <RegisterPage 
            onRegisterSuccess={() => setView('home')}
            onGoToLogin={() => setView('login')}
          />
        )}

        {view === 'confirmation' && (
          <BookingConfirmationPage 
            booking={confirmedBooking}
            onGoToBookings={() => setView('my-bookings')}
            onGoHome={() => setView('home')}
          />
        )}
      </main>

      <Footer setView={setView} />

      {/* Booking Modal */}
      {showBookingModal && bookingHotel && bookingRoom && (
        <BookingModal 
          hotel={bookingHotel}
          room={bookingRoom}
          initialDates={searchFilters}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingDetailsReady}
        />
      )}

      {/* Payment Simulation Modal */}
      {showPaymentModal && pendingBooking && (
        <PaymentModal 
          booking={pendingBooking}
          pricing={pendingPricing}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
