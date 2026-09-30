// API service for StayEase Hotel Booking System
const API_BASE_URL = window.location.port === '3000' || window.location.port === '5173'
  ? 'http://localhost:5000'
  : '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('stayease_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Hotels
  async getHotels(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const res = await fetch(`${API_BASE_URL}/api/hotels?${query.toString()}`);
    return res.json();
  },

  async getHotel(id) {
    const res = await fetch(`${API_BASE_URL}/api/hotels/${id}`);
    return res.json();
  },

  async createHotel(hotelData) {
    const res = await fetch(`${API_BASE_URL}/api/hotels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(hotelData)
    });
    return res.json();
  },

  async updateHotel(id, hotelData) {
    const res = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(hotelData)
    });
    return res.json();
  },

  async deleteHotel(id) {
    const res = await fetch(`${API_BASE_URL}/api/hotels/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Rooms
  async getHotelRooms(hotelId) {
    const res = await fetch(`${API_BASE_URL}/api/hotels/${hotelId}/rooms`);
    return res.json();
  },

  async getAllRooms() {
    const res = await fetch(`${API_BASE_URL}/api/rooms`);
    return res.json();
  },

  async createRoom(roomData) {
    const res = await fetch(`${API_BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return res.json();
  },

  async updateRoom(id, roomData) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roomData)
    });
    return res.json();
  },

  async deleteRoom(id) {
    const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Bookings
  async createBooking(bookingData) {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  async getBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/api/bookings?${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getBooking(identifier) {
    const res = await fetch(`${API_BASE_URL}/api/bookings/${identifier}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async cancelBooking(identifier) {
    const res = await fetch(`${API_BASE_URL}/api/bookings/${identifier}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateBookingStatus(identifier, status) {
    const res = await fetch(`${API_BASE_URL}/api/bookings/${identifier}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Payments
  async processPayment(paymentData) {
    const res = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(paymentData)
    });
    return res.json();
  },

  // Admin Dashboard
  async getAdminDashboard() {
    const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Infrastructure Health Check
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  }
};
