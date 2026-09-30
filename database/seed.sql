-- ==========================================================
-- StayEase - Hotel Booking System Sample Data Seed (Indian Luxury Hotels)
-- Prices in Indian Rupees (INR - ₹)
-- ==========================================================

USE hotel_booking_db;

-- Clear existing data if any (in correct order of foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE bookings;
TRUNCATE TABLE rooms;
TRUNCATE TABLE hotels;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Admin & Customers)
-- Passwords below correspond to 'admin123' and 'user123'
INSERT INTO users (id, name, email, phone, password, role) VALUES
(1, 'Admin User', 'admin@stayease.com', '+91-98765-43210', 'scrypt:32768:8:1$TRgwmGvBdjvSpbwh$c04f09c150ef890745a9d84d5ff155eeb696bed1752f23528d7dd2c9b5f68102c974a723c7d36ddb3459803bb271a04d1de37fa9d674acf72c3eb3d84dd9e486', 'admin'),
(2, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'scrypt:32768:8:1$G0jIOQ2cljJWDHRn$b02d67353f8e0e7a48973060dc72638a6400475662af9653573204137294d2eac995b897d28eb42c9a406d6aa0bb5c82e7fd6395f394061c2fa8eade2e1f3510', 'user'),
(3, 'Sophia Patel', 'sophia.patel@example.com', '+91-99887-76655', 'scrypt:32768:8:1$G0jIOQ2cljJWDHRn$b02d67353f8e0e7a48973060dc72638a6400475662af9653573204137294d2eac995b897d28eb42c9a406d6aa0bb5c82e7fd6395f394061c2fa8eade2e1f3510', 'user');

-- 2. Insert Hotels (Top Luxury Destinations Across India)
INSERT INTO hotels (id, name, location, description, rating, image, gallery, facilities, starting_price) VALUES
(1, 'The Leela Beach Resort & Spa', 'South Goa, Goa', 
 'Nestled along the pristine Mobor Beach, The Leela Goa offers 75 acres of lush tropical lagoons, private beach access, 12-hole golf, and world-class Ayurvedic spa sanctuaries.', 
 4.9, 
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Swimming pool, Beach Access, Restaurant, Spa, Air conditioning, 24/7 reception, Golf Course', 
 5500.00),

(2, 'The Taj Mahal Palace & Tower', 'Colaba, Mumbai, Maharashtra', 
 'Built in 1903 facing the Gateway of India and the Arabian Sea, this legendary architectural marvel offers signature fine dining, heritage suites, and legendary Indian hospitality.', 
 4.9, 
 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Swimming pool, Arabian Sea View, Restaurant, 24/7 reception, Jiva Spa, Valet Parking', 
 8900.00),

(3, 'The Oberoi Udaivilas Palace', 'Lake Pichola, Udaipur, Rajasthan', 
 'Sprawled over 50 acres on the tranquil banks of Lake Pichola, featuring grand domes, hand-carved stone columns, gold leaf frescoes, and private boat transfers.', 
 4.9, 
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Swimming pool, Lake View, Fine Dining, Royal Spa, Air conditioning, Boat Transfers', 
 9500.00),

(4, 'ITC Grand Chola Luxury Collection', 'Guindy, Chennai, Tamil Nadu', 
 'Inspired by the monumental Chola Dynasty temple architecture, presenting 10 award-winning restaurants, royal marble corridors, and grand presidential suites.', 
 4.8, 
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Swimming pool, 10 Restaurants, Kaya Kalp Spa, Air conditioning, 24/7 reception, Fitness Center', 
 4800.00),

(5, 'Wildflower Hall Himalayan Sanctuary', 'Mashobra, Shimla, Himachal Pradesh', 
 'Perched 8,250 feet above sea level amidst majestic cedar pine forests, offering heated infinity hot tubs overlooking snow-clad Himalayan mountain peaks.', 
 4.9, 
 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Heated Indoor Pool, Cedar Spa, Mountain View, Restaurant, Fireplace, Nature Trails', 
 7200.00),

(6, 'Kumarakom Lake Resort & Heritage', 'Kumarakom, Kottayam, Kerala', 
 'Consistently awarded the jewel of Kerala backwaters, offering 16th-century heritage villas, meander pool villas, and houseboats gently floating along Vembanad Lake.', 
 4.8, 
 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Infinity Pool, Backwater Cruise, Ayurvedic Spa, Seafood Restaurant, Balcony', 
 6200.00),

(7, 'Rambagh Palace Heritage Royal', 'Bhawani Singh Road, Jaipur, Rajasthan', 
 'The former residence of the Maharaja of Jaipur, this jewel of Rajasthan features 47 acres of tranquil Mughal gardens, peacocks, and opulent Rajput craftsmanship.', 
 4.9, 
 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Palace Gardens, Swimming pool, Fine Dining, Peacock Courtyard, Royal Spa, Room service', 
 8500.00),

(8, 'The Ritz-Carlton Garden City', 'Residency Road, Bengaluru, Karnataka', 
 'A sanctuary of urban luxury in India’s Silicon Valley, featuring a stunning rooftop lounge, Jaali architectural lattice work, and serene wellness retreats.', 
 4.7, 
 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
 '["https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"]',
 'Wi-Fi, Rooftop Bar, Spa, Swimming pool, 24/7 reception, Business Lounge, Valet Parking', 
 5200.00);

-- 3. Insert Rooms (Indian Rupee Rates)
INSERT INTO rooms (id, hotel_id, room_type, price, capacity, bed_type, description, image, facilities, availability) VALUES
-- Hotel 1 (Goa)
(1, 1, 'Deluxe Lagoon View King Suite', 5500.00, 2, 'King Bed', 'Private Portuguese balcony overlooking tranquil freshwater lagoons with luxury marble bathroom.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Lagoon View, Balcony, Mini Bar, King Bed, Free Wi-Fi, Ayurvedic Toiletries', TRUE),
(2, 1, 'Royal Beachfront Villa with Plunge Pool', 11200.00, 4, 'Master King Bed', 'Direct golden sand beach access, private plunge pool, outdoor daybed pavilion, and personal butler.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Private Plunge Pool, Beach Access, Butler Service, Jacuzzi, Free Breakfast', TRUE),

-- Hotel 2 (Mumbai)
(3, 2, 'Gateway Heritage Sea Facing Room', 8900.00, 2, 'King Bed', 'Panoramic Arabian Sea views looking out onto the Gateway of India; rich Burmese teakwood furnishings.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 'Sea View, High-Speed Wi-Fi, Work Desk, Nespresso, Smart Lighting', TRUE),
(4, 2, 'Grand Presidential Luxury Suite', 18500.00, 4, '2 King Beds', 'The ultimate Mumbai residence featuring private dining hall, curated Indian art, and 24-hour butler.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Arabian Sea View, Butler Service, Deep Soaking Tub, Executive Lounge', TRUE),

-- Hotel 3 (Udaipur)
(5, 3, 'Premier Lake View Suite with Pool', 9500.00, 2, 'King Bed', 'Opens directly onto a semi-private moat pool overlooking Lake Pichola and the City Palace.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80', 'Lake View, Pool Access, Mewar Architecture, Clawfoot Tub, Free Wi-Fi', TRUE),
(6, 3, 'Kohinoor Royal Palace Villa', 22000.00, 4, '2 King Beds', 'Gold-leaf ceilings, mirror mosaic styling, private courtyard pool, and Rajasthani royal dining.', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', 'Private Pool, Garden Courtyard, Royal Dining, Jacuzzi, Lake Panorama', TRUE),

-- Hotel 4 (Chennai)
(7, 4, 'Executive Club Luxury Room', 4800.00, 2, 'King Bed', 'Spacious royal chamber with hand-carved temple motifs, plush mattress, and city views.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 'City View, King Bed, Free Wi-Fi, Rain Shower, Express Check-In', TRUE),
(8, 4, 'Chola Royal Chamber Suite', 9800.00, 4, '2 Queen Beds', 'Dual chamber family suite inspired by Tanjore art, with deep soaking tub and lounge access.', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80', '2 Queen Beds, Deep Tub, Workstation, Lounge Access, Free Breakfast', TRUE),

-- Hotel 5 (Shimla)
(9, 5, 'Mountain View Cedar Chalet', 7200.00, 2, 'King Bed', 'Solid teakwood floorboards, working fireplace, and panoramic views of snow-capped Himalayan ranges.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80', 'Himalayan View, Fireplace, Heated Floors, Balcony, Coffee Bar', TRUE),
(10, 5, 'Himalayan Pinnacle Master Suite', 14500.00, 4, '2 King Beds', 'Two master bedrooms opening directly onto private heated deck facing the Pir Panjal ranges.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Heated Deck, 2 King Beds, Fireplace, Cedar Bath, Mountain Vista', TRUE),

-- Hotel 6 (Kerala)
(11, 6, 'Traditional Kerala Heritage Villa', 6200.00, 2, 'King Bed', 'Century-old homestead reconstructed with wooden gables, open-to-sky shower, and garden courtyard.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', 'Open-to-sky Shower, Garden View, King Bed, Free Wi-Fi, Heritage Woodwork', TRUE),
(12, 6, 'Luxury Backwater Pavilion with Jacuzzi', 12800.00, 4, '1 King + 2 Twin Beds', 'Set directly at the edge of the backwaters with private infinity plunge jacuzzi and sunset deck.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 'Backwater View, Private Jacuzzi, Sunset Deck, Butler Service, Dining Nook', TRUE),

-- Hotel 7 (Jaipur)
(13, 7, 'Palace Luxury Historical Room', 8500.00, 2, 'King Bed', 'Authentic heritage room adorned with antique Rajput weapons, miniature paintings, and garden views.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Palace Garden View, King Bed, Heritage Decor, Marble Bathroom, Free Wi-Fi', TRUE),
(14, 7, 'Royal Maharajah Suite', 19500.00, 4, '2 King Beds', 'The pinnacle of Rajasthani royalty with private terrace, crystal chandeliers, and dining hall.', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Private Terrace, Royal Courtyard, Peacock View, Jacuzzi, Butler Service', TRUE),

-- Hotel 8 (Bengaluru)
(15, 8, 'Deluxe Garden View King Room', 5200.00, 2, 'King Bed', 'Modern technological comforts paired with hand-tufted carpets and city skyline views.', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 'City Skyline, King Bed, Free High-Speed Wi-Fi, Ergonomic Desk, Marble Bath', TRUE),
(16, 8, 'Executive Metropolitan Suite', 10500.00, 3, 'King Bed + Daybed', 'Spacious executive sanctuary with private meeting lounge, Nespresso bar, and club access.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80', 'Ritz-Carlton Club Access, Meeting Lounge, Deep Tub, Sunset View, Breakfast', TRUE);

-- 4. Insert Sample Bookings (INR Amounts)
INSERT INTO bookings (id, booking_id, user_id, hotel_id, room_id, guest_name, guest_email, guest_phone, special_requests, check_in, check_out, guests, total_amount, status, booking_date) VALUES
(1, 'STE-2026-9101', 2, 1, 1, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'Late check-in requested at 7 PM. High floor preferred.', '2026-10-15', '2026-10-18', 2, 18480.00, 'Confirmed', '2026-09-28 14:20:00'),
(2, 'STE-2026-4428', 2, 2, 3, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'Quiet room facing the Arabian Sea.', '2026-11-02', '2026-11-05', 2, 29904.00, 'Confirmed', '2026-09-29 09:15:00'),
(3, 'STE-2026-3391', 3, 3, 5, 'Sophia Patel', 'sophia.patel@example.com', '+91-99887-76655', 'Celebrating anniversary! Flowers and cake if possible.', '2026-12-20', '2026-12-24', 2, 42560.00, 'Confirmed', '2026-09-30 11:45:00'),
(4, 'STE-2026-7812', 3, 5, 9, 'Sophia Patel', 'sophia.patel@example.com', '+91-99887-76655', 'None', '2026-08-10', '2026-08-12', 2, 16128.00, 'Completed', '2026-08-01 10:00:00'),
(5, 'STE-2026-1109', 2, 6, 11, 'Alex Morgan', 'alex.morgan@example.com', '+91-98123-45678', 'Travel date rescheduled', '2026-09-01', '2026-09-03', 2, 13888.00, 'Cancelled', '2026-08-25 16:30:00');

-- 5. Insert Sample Payments (INR Amounts)
INSERT INTO payments (id, booking_id, payment_method, amount, payment_status, transaction_reference, payment_date) VALUES
(1, 1, 'Credit/Debit Card', 18480.00, 'Success', 'TXN-LEELA-9101-18480', '2026-09-28 14:21:00'),
(2, 2, 'UPI', 29904.00, 'Success', 'UPI-TAJ-4428-29904', '2026-09-29 09:16:00'),
(3, 3, 'Net Banking', 42560.00, 'Success', 'NB-UDVIL-3391-42560', '2026-09-30 11:46:00'),
(4, 4, 'Credit/Debit Card', 16128.00, 'Success', 'TXN-SHIML-7812-16128', '2026-08-01 10:01:00');
