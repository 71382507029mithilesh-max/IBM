import json
from services.db import query, query_one, execute

class Hotel:
    @staticmethod
    def get_all(location=None, min_price=None, max_price=None, min_rating=None, 
                facilities=None, sort_by=None, room_type=None):
        sql = "SELECT * FROM hotels WHERE 1=1"
        params = []

        if location:
            sql += " AND (LOWER(location) LIKE %s OR LOWER(name) LIKE %s)"
            loc_pattern = f"%{location.lower()}%"
            params.extend([loc_pattern, loc_pattern])

        if min_price is not None:
            sql += " AND starting_price >= %s"
            params.append(float(min_price))

        if max_price is not None:
            sql += " AND starting_price <= %s"
            params.append(float(max_price))

        if min_rating is not None:
            sql += " AND rating >= %s"
            params.append(float(min_rating))

        if facilities:
            # Match facility in facilities text
            facility_list = [f.strip() for f in facilities.split(',') if f.strip()]
            for fac in facility_list:
                sql += " AND LOWER(facilities) LIKE %s"
                params.append(f"%{fac.lower()}%")

        if room_type:
            sql += """ AND id IN (
                SELECT DISTINCT hotel_id FROM rooms 
                WHERE LOWER(room_type) LIKE %s AND availability = 1
            )"""
            params.append(f"%{room_type.lower()}%")

        # Sorting logic
        if sort_by == 'price_asc':
            sql += " ORDER BY starting_price ASC"
        elif sort_by == 'price_desc':
            sql += " ORDER BY starting_price DESC"
        elif sort_by == 'rating_desc' or sort_by == 'rating':
            sql += " ORDER BY rating DESC"
        else:
            sql += " ORDER BY rating DESC, starting_price ASC"

        hotels = query(sql, params)
        for h in hotels:
            Hotel._format_hotel(h)
        return hotels

    @staticmethod
    def get_by_id(hotel_id):
        hotel = query_one("SELECT * FROM hotels WHERE id = %s", (hotel_id,))
        if hotel:
            Hotel._format_hotel(hotel)
        return hotel

    @staticmethod
    def create(name, location, description, rating, image, gallery, facilities, starting_price):
        if isinstance(gallery, list):
            gallery_str = json.dumps(gallery)
        else:
            gallery_str = str(gallery)

        if isinstance(facilities, list):
            facilities_str = ", ".join(facilities)
        else:
            facilities_str = str(facilities)

        sql = """
        INSERT INTO hotels (name, location, description, rating, image, gallery, facilities, starting_price)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        hotel_id = execute(sql, (
            name.strip(), location.strip(), description.strip(), 
            float(rating), image.strip(), gallery_str, 
            facilities_str, float(starting_price)
        ))
        return Hotel.get_by_id(hotel_id)

    @staticmethod
    def update(hotel_id, data):
        fields = []
        params = []
        for key in ['name', 'location', 'description', 'rating', 'image', 'starting_price']:
            if key in data:
                fields.append(f"{key} = %s")
                params.append(data[key])
        
        if 'gallery' in data:
            fields.append("gallery = %s")
            val = json.dumps(data['gallery']) if isinstance(data['gallery'], list) else str(data['gallery'])
            params.append(val)

        if 'facilities' in data:
            fields.append("facilities = %s")
            val = ", ".join(data['facilities']) if isinstance(data['facilities'], list) else str(data['facilities'])
            params.append(val)

        if not fields:
            return Hotel.get_by_id(hotel_id)

        params.append(hotel_id)
        sql = f"UPDATE hotels SET {', '.join(fields)} WHERE id = %s"
        execute(sql, params)
        return Hotel.get_by_id(hotel_id)

    @staticmethod
    def delete(hotel_id):
        execute("DELETE FROM hotels WHERE id = %s", (hotel_id,))
        return True

    @staticmethod
    def _format_hotel(hotel):
        if not hotel:
            return
        # Parse gallery JSON if available
        raw_gallery = hotel.get('gallery')
        if raw_gallery:
            try:
                hotel['gallery'] = json.loads(raw_gallery)
            except Exception:
                hotel['gallery'] = [img.strip() for img in str(raw_gallery).split(',') if img.strip()]
        else:
            hotel['gallery'] = [hotel['image']] if hotel.get('image') else []

        # Convert facilities string to clean list
        raw_fac = hotel.get('facilities', '')
        if isinstance(raw_fac, str):
            hotel['facilities_list'] = [f.strip() for f in raw_fac.split(',') if f.strip()]
        else:
            hotel['facilities_list'] = raw_fac or []
