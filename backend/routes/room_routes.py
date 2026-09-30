from flask import Blueprint, request, jsonify
from models.room import Room
from models.hotel import Hotel
from routes.auth_routes import admin_required

room_bp = Blueprint('room_bp', __name__)

@room_bp.route('/hotels/<int:hotel_id>/rooms', methods=['GET'])
def get_hotel_rooms(hotel_id):
    try:
        hotel = Hotel.get_by_id(hotel_id)
        if not hotel:
            return jsonify({'success': False, 'message': 'Hotel not found'}), 404

        rooms = Room.get_by_hotel(hotel_id)
        return jsonify({
            'success': True,
            'hotel_id': hotel_id,
            'hotel_name': hotel['name'],
            'count': len(rooms),
            'rooms': rooms
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to retrieve rooms: {str(e)}'}), 500

@room_bp.route('/rooms', methods=['GET'])
def get_all_rooms():
    try:
        rooms = Room.get_all()
        return jsonify({
            'success': True,
            'count': len(rooms),
            'rooms': rooms
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to fetch rooms: {str(e)}'}), 500

@room_bp.route('/rooms/<int:room_id>', methods=['GET'])
def get_single_room(room_id):
    try:
        room = Room.get_by_id(room_id)
        if not room:
            return jsonify({'success': False, 'message': 'Room not found'}), 404
        return jsonify({'success': True, 'room': room}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching room: {str(e)}'}), 500

@room_bp.route('/rooms', methods=['POST'])
@admin_required
def create_room():
    data = request.get_json() or {}
    hotel_id = data.get('hotel_id')
    room_type = data.get('room_type')
    price = data.get('price')
    image = data.get('image')

    if not hotel_id or not room_type or price is None or not image:
        return jsonify({'success': False, 'message': 'hotel_id, room_type, price, and image are required.'}), 400

    hotel = Hotel.get_by_id(hotel_id)
    if not hotel:
        return jsonify({'success': False, 'message': 'Referenced hotel does not exist.'}), 404

    try:
        room = Room.create(
            hotel_id=hotel_id,
            room_type=room_type,
            price=price,
            capacity=data.get('capacity', 2),
            bed_type=data.get('bed_type', 'King Bed'),
            description=data.get('description', ''),
            image=image,
            facilities=data.get('facilities', 'Free Wi-Fi, Air Conditioning'),
            availability=data.get('availability', True)
        )
        return jsonify({
            'success': True,
            'message': 'Room added successfully!',
            'room': room
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to add room: {str(e)}'}), 500

@room_bp.route('/rooms/<int:room_id>', methods=['PUT'])
@admin_required
def update_room(room_id):
    data = request.get_json() or {}
    try:
        existing = Room.get_by_id(room_id)
        if not existing:
            return jsonify({'success': False, 'message': 'Room not found'}), 404

        updated = Room.update(room_id, data)
        return jsonify({
            'success': True,
            'message': 'Room updated successfully.',
            'room': updated
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Room update failed: {str(e)}'}), 500

@room_bp.route('/rooms/<int:room_id>', methods=['DELETE'])
@admin_required
def delete_room(room_id):
    try:
        existing = Room.get_by_id(room_id)
        if not existing:
            return jsonify({'success': False, 'message': 'Room not found'}), 404

        Room.delete(room_id)
        return jsonify({
            'success': True,
            'message': 'Room deleted successfully.'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to delete room: {str(e)}'}), 500
