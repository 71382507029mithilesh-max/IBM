from flask import Blueprint, request, jsonify
from models.hotel import Hotel
from models.room import Room
from routes.auth_routes import admin_required

hotel_bp = Blueprint('hotel_bp', __name__)

@hotel_bp.route('', methods=['GET'])
def list_hotels():
    try:
        location = request.args.get('location')
        min_price = request.args.get('min_price')
        max_price = request.args.get('max_price')
        min_rating = request.args.get('min_rating')
        facilities = request.args.get('facilities')
        sort_by = request.args.get('sort_by')
        room_type = request.args.get('room_type')

        hotels = Hotel.get_all(
            location=location,
            min_price=min_price,
            max_price=max_price,
            min_rating=min_rating,
            facilities=facilities,
            sort_by=sort_by,
            room_type=room_type
        )
        return jsonify({
            'success': True,
            'count': len(hotels),
            'hotels': hotels
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to retrieve hotels: {str(e)}'}), 500

@hotel_bp.route('/<int:hotel_id>', methods=['GET'])
def get_hotel(hotel_id):
    try:
        hotel = Hotel.get_by_id(hotel_id)
        if not hotel:
            return jsonify({'success': False, 'message': 'Hotel not found'}), 404

        # Include rooms for the hotel
        rooms = Room.get_by_hotel(hotel_id)
        hotel['rooms'] = rooms

        return jsonify({
            'success': True,
            'hotel': hotel
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error fetching hotel: {str(e)}'}), 500

@hotel_bp.route('', methods=['POST'])
@admin_required
def create_hotel():
    data = request.get_json() or {}
    name = data.get('name')
    location = data.get('location')
    starting_price = data.get('starting_price')
    image = data.get('image')

    if not name or not location or starting_price is None or not image:
        return jsonify({'success': False, 'message': 'Name, location, image, and starting price are required.'}), 400

    try:
        hotel = Hotel.create(
            name=name,
            location=location,
            description=data.get('description', ''),
            rating=data.get('rating', 4.5),
            image=image,
            gallery=data.get('gallery', [image]),
            facilities=data.get('facilities', 'Wi-Fi, Air conditioning'),
            starting_price=starting_price
        )
        return jsonify({
            'success': True,
            'message': 'Hotel created successfully!',
            'hotel': hotel
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to create hotel: {str(e)}'}), 500

@hotel_bp.route('/<int:hotel_id>', methods=['PUT'])
@admin_required
def update_hotel(hotel_id):
    data = request.get_json() or {}
    try:
        existing = Hotel.get_by_id(hotel_id)
        if not existing:
            return jsonify({'success': False, 'message': 'Hotel not found'}), 404

        updated = Hotel.update(hotel_id, data)
        return jsonify({
            'success': True,
            'message': 'Hotel details updated successfully.',
            'hotel': updated
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Update failed: {str(e)}'}), 500

@hotel_bp.route('/<int:hotel_id>', methods=['DELETE'])
@admin_required
def delete_hotel(hotel_id):
    try:
        existing = Hotel.get_by_id(hotel_id)
        if not existing:
            return jsonify({'success': False, 'message': 'Hotel not found'}), 404

        Hotel.delete(hotel_id)
        return jsonify({
            'success': True,
            'message': 'Hotel deleted successfully.'
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Failed to delete hotel: {str(e)}'}), 500
