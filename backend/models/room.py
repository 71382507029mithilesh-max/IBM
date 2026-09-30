from services.db import query, query_one, execute

class Room:
    @staticmethod
    def get_by_hotel(hotel_id):
        rooms = query("SELECT * FROM rooms WHERE hotel_id = %s ORDER BY price ASC", (hotel_id,))
        for r in rooms:
            Room._format_room(r)
        return rooms

    @staticmethod
    def get_by_id(room_id):
        room = query_one("SELECT * FROM rooms WHERE id = %s", (room_id,))
        if room:
            Room._format_room(room)
        return room

    @staticmethod
    def get_all():
        rooms = query("""
        SELECT r.*, h.name as hotel_name, h.location as hotel_location
        FROM rooms r
        JOIN hotels h ON r.hotel_id = h.id
        ORDER BY r.id ASC
        """)
        for r in rooms:
            Room._format_room(r)
        return rooms

    @staticmethod
    def create(hotel_id, room_type, price, capacity, bed_type, description, image, facilities, availability=True):
        if isinstance(facilities, list):
            facilities_str = ", ".join(facilities)
        else:
            facilities_str = str(facilities)

        sql = """
        INSERT INTO rooms (hotel_id, room_type, price, capacity, bed_type, description, image, facilities, availability)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        room_id = execute(sql, (
            int(hotel_id), room_type.strip(), float(price), int(capacity),
            bed_type.strip(), description.strip(), image.strip(),
            facilities_str, 1 if availability else 0
        ))
        return Room.get_by_id(room_id)

    @staticmethod
    def update(room_id, data):
        fields = []
        params = []
        for key in ['room_type', 'price', 'capacity', 'bed_type', 'description', 'image', 'availability']:
            if key in data:
                fields.append(f"{key} = %s")
                if key == 'availability':
                    params.append(1 if data[key] else 0)
                elif key == 'price':
                    params.append(float(data[key]))
                elif key == 'capacity':
                    params.append(int(data[key]))
                else:
                    params.append(data[key])

        if 'facilities' in data:
            fields.append("facilities = %s")
            val = ", ".join(data['facilities']) if isinstance(data['facilities'], list) else str(data['facilities'])
            params.append(val)

        if not fields:
            return Room.get_by_id(room_id)

        params.append(room_id)
        sql = f"UPDATE rooms SET {', '.join(fields)} WHERE id = %s"
        execute(sql, params)
        return Room.get_by_id(room_id)

    @staticmethod
    def delete(room_id):
        execute("DELETE FROM rooms WHERE id = %s", (room_id,))
        return True

    @staticmethod
    def _format_room(room):
        if not room:
            return
        raw_fac = room.get('facilities', '')
        if isinstance(raw_fac, str):
            room['facilities_list'] = [f.strip() for f in raw_fac.split(',') if f.strip()]
        else:
            room['facilities_list'] = raw_fac or []
        room['availability'] = bool(room.get('availability', 1))
