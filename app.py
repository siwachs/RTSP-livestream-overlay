from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
import logging
from marshmallow import Schema, fields, ValidationError
import cv2
import threading
import base64
from werkzeug.exceptions import BadRequest, NotFound
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuration
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/livestream_app')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Extensions
CORS(app)
mongo = PyMongo(app)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Validation Schemas
class OverlaySchema(Schema):
    type = fields.Str(required=True, validate=lambda x: x in ['text', 'image', 'logo'])
    content = fields.Str(required=True)
    x = fields.Float(required=True, validate=lambda x: 0 <= x <= 100)
    y = fields.Float(required=True, validate=lambda y: 0 <= y <= 100)
    width = fields.Float(required=True, validate=lambda x: x > 0)
    height = fields.Float(required=True, validate=lambda x: x > 0)
    fontSize = fields.Int(missing=16, validate=lambda x: 8 <= x <= 72)
    color = fields.Str(missing='#ffffff')
    backgroundColor = fields.Str(missing='rgba(0,0,0,0.5)')
    borderRadius = fields.Int(missing=0, validate=lambda x: x >= 0)
    opacity = fields.Float(missing=1.0, validate=lambda x: 0 <= x <= 1)
    rotation = fields.Float(missing=0)
    zIndex = fields.Int(missing=1)
    animation = fields.Str(missing='none', validate=lambda x: x in ['none', 'fade', 'slide', 'bounce'])
    isVisible = fields.Bool(missing=True)

class StreamSettingsSchema(Schema):
    rtspUrl = fields.Str(required=True)
    quality = fields.Str(missing='720p', validate=lambda x: x in ['480p', '720p', '1080p'])
    bitrate = fields.Int(missing=2000, validate=lambda x: 500 <= x <= 10000)
    frameRate = fields.Int(missing=30, validate=lambda x: 15 <= x <= 60)
    autoReconnect = fields.Bool(missing=True)
    bufferSize = fields.Int(missing=3, validate=lambda x: 1 <= x <= 10)

# Error Handlers
@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({'error': 'Validation failed', 'messages': e.messages}), 400

@app.errorhandler(BadRequest)
def handle_bad_request(e):
    return jsonify({'error': 'Bad request', 'message': str(e)}), 400

@app.errorhandler(NotFound)
def handle_not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(Exception)
def handle_general_error(e):
    logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({'error': 'Internal server error'}), 500

# Helper Functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    return doc

def validate_rtsp_url(url):
    """Validate RTSP URL format and accessibility"""
    if not url.startswith('rtsp://'):
        return False, "URL must start with 'rtsp://'"
    
    try:
        # Basic connectivity test
        cap = cv2.VideoCapture(url)
        ret = cap.isOpened()
        cap.release()
        return ret, "RTSP stream is accessible" if ret else "Cannot connect to RTSP stream"
    except Exception as e:
        return False, f"Error testing RTSP connection: {str(e)}"

# Stream Management Class
class StreamManager:
    def __init__(self):
        self.active_streams = {}
        self.stream_stats = {}
    
    def start_stream(self, stream_id, rtsp_url):
        """Start monitoring an RTSP stream"""
        if stream_id in self.active_streams:
            return False, "Stream already active"
        
        try:
            cap = cv2.VideoCapture(rtsp_url)
            if not cap.isOpened():
                return False, "Cannot open RTSP stream"
            
            self.active_streams[stream_id] = {
                'cap': cap,
                'rtsp_url': rtsp_url,
                'start_time': datetime.now(datetime.timezone.utc),
                'status': 'active'
            }
            
            self.stream_stats[stream_id] = {
                'frames_processed': 0,
                'last_frame_time': None,
                'errors': 0
            }
            
            return True, "Stream started successfully"
        except Exception as e:
            return False, f"Error starting stream: {str(e)}"
    
    def stop_stream(self, stream_id):
        """Stop monitoring an RTSP stream"""
        if stream_id in self.active_streams:
            self.active_streams[stream_id]['cap'].release()
            del self.active_streams[stream_id]
            return True
        return False
    
    def get_stream_status(self, stream_id):
        """Get status of a stream"""
        if stream_id not in self.active_streams:
            return None
        
        stream = self.active_streams[stream_id]
        stats = self.stream_stats.get(stream_id, {})
        
        return {
            'status': stream['status'],
            'rtsp_url': stream['rtsp_url'],
            'start_time': stream['start_time'].isoformat(),
            'uptime': (datetime.now(datetime.timezone.utc) - stream['start_time']).total_seconds(),
            'stats': stats
        }

stream_manager = StreamManager()

# API Routes

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'StreamOverlay API',
        'version': '1.0.0',
        'timestamp': datetime.now(datetime.timezone.utc).toisoformat()
    })

# Overlay Management Routes

@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    """Get all overlays with pagination and filtering"""
    try:
        # Query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        overlay_type = request.args.get('type')
        is_visible = request.args.get('visible')
        
        # Build query
        query = {}
        if overlay_type:
            query['type'] = overlay_type
        if is_visible is not None:
            query['isVisible'] = is_visible.lower() == 'true'
        
        # Execute query with pagination
        skip = (page - 1) * limit
        overlays = list(mongo.db.overlays.find(query).skip(skip).limit(limit).sort('createdAt', -1))
        total = mongo.db.overlays.count_documents(query)
        
        # Serialize results
        overlays = [serialize_doc(overlay) for overlay in overlays]
        
        return jsonify({
            'overlays': overlays,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching overlays: {str(e)}")
        return jsonify({'error': 'Failed to fetch overlays'}), 500

@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    """Create a new overlay"""
    try:
        # Validate input
        schema = OverlaySchema()
        data = schema.load(request.json)
        
        # Add metadata
        data['createdAt'] = datetime.now(datetime.timezone.utc)
        data['updatedAt'] = datetime.now(datetime.timezone.utc)
        data['version'] = 1
        
        # Insert into database
        result = mongo.db.overlays.insert_one(data)
        
        # Fetch and return created overlay
        overlay = mongo.db.overlays.find_one({'_id': result.inserted_id})
        
        logger.info(f"Created overlay: {result.inserted_id}")
        return jsonify(serialize_doc(overlay)), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'messages': e.messages}), 400
    except Exception as e:
        logger.error(f"Error creating overlay: {str(e)}")
        return jsonify({'error': 'Failed to create overlay'}), 500

@app.route('/api/overlays/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    """Get a specific overlay by ID"""
    try:
        overlay = mongo.db.overlays.find_one({'_id': ObjectId(overlay_id)})
        if not overlay:
            raise NotFound('Overlay not found')
        
        return jsonify(serialize_doc(overlay))
        
    except Exception as e:
        logger.error(f"Error fetching overlay {overlay_id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch overlay'}), 500

@app.route('/api/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    """Update an existing overlay"""
    try:
        # Validate input
        schema = OverlaySchema(partial=True)
        data = schema.load(request.json)
        
        # Add update metadata
        data['updatedAt'] = datetime.now(datetime.timezone.utc)
        
        # Update in database
        result = mongo.db.overlays.update_one(
            {'_id': ObjectId(overlay_id)},
            {'$set': data, '$inc': {'version': 1}}
        )
        
        if result.matched_count == 0:
            raise NotFound('Overlay not found')
        
        # Fetch and return updated overlay
        overlay = mongo.db.overlays.find_one({'_id': ObjectId(overlay_id)})
        
        logger.info(f"Updated overlay: {overlay_id}")
        return jsonify(serialize_doc(overlay))
        
    except ValidationError as e:
        return jsonify({'error': 'Validation failed', 'messages': e.messages}), 400
    except Exception as e:
        logger.error(f"Error updating overlay {overlay_id}: {str(e)}")
        return jsonify({'error': 'Failed to update overlay'}), 500

@app.route('/api/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    """Delete an overlay"""
    try:
        result = mongo.db.overlays.delete_one({'_id': ObjectId(overlay_id)})
        
        if result.deleted_count == 0:
            raise NotFound('Overlay not found')
        
        logger.info(f"Deleted overlay: {overlay_id}")
        return jsonify({'message': 'Overlay deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting overlay {overlay_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete overlay'}), 500

@app.route('/api/overlays/bulk', methods=['POST'])
def bulk_update_overlays():
    """Bulk update multiple overlays"""
    try:
        data = request.json
        operations = data.get('operations', [])
        
        results = []
        for op in operations:
            op_type = op.get('type')
            overlay_id = op.get('id')
            overlay_data = op.get('data', {})
            
            if op_type == 'update':
                schema = OverlaySchema(partial=True)
                validated_data = schema.load(overlay_data)
                validated_data['updatedAt'] = datetime.now(datetime.timezone.utc)
                
                result = mongo.db.overlays.update_one(
                    {'_id': ObjectId(overlay_id)},
                    {'$set': validated_data, '$inc': {'version': 1}}
                )
                results.append({'id': overlay_id, 'success': result.matched_count > 0})
            
            elif op_type == 'delete':
                result = mongo.db.overlays.delete_one({'_id': ObjectId(overlay_id)})
                results.append({'id': overlay_id, 'success': result.deleted_count > 0})
        
        return jsonify({'results': results})
        
    except Exception as e:
        logger.error(f"Error in bulk operation: {str(e)}")
        return jsonify({'error': 'Bulk operation failed'}), 500

# Stream Management Routes

@app.route('/api/streams/validate', methods=['POST'])
def validate_stream():
    """Validate RTSP URL"""
    try:
        data = request.json
        rtsp_url = data.get('rtspUrl')
        
        if not rtsp_url:
            return jsonify({'error': 'RTSP URL is required'}), 400
        
        is_valid, message = validate_rtsp_url(rtsp_url)
        
        return jsonify({
            'valid': is_valid,
            'message': message,
            'url': rtsp_url
        })
        
    except Exception as e:
        logger.error(f"Error validating stream: {str(e)}")
        return jsonify({'error': 'Failed to validate stream'}), 500

@app.route('/api/streams/<stream_id>/start', methods=['POST'])
def start_stream(stream_id):
    """Start monitoring a stream"""
    try:
        data = request.json
        rtsp_url = data.get('rtspUrl')
        
        if not rtsp_url:
            return jsonify({'error': 'RTSP URL is required'}), 400
        
        success, message = stream_manager.start_stream(stream_id, rtsp_url)
        
        if success:
            # Save stream settings to database
            stream_data = {
                'streamId': stream_id,
                'rtspUrl': rtsp_url,
                'status': 'active',
                'startTime': datetime.now(datetime.timezone.utc),
                'settings': data.get('settings', {})
            }
            
            mongo.db.streams.update_one(
                {'streamId': stream_id},
                {'$set': stream_data},
                upsert=True
            )
            
            return jsonify({'message': message, 'streamId': stream_id})
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        logger.error(f"Error starting stream {stream_id}: {str(e)}")
        return jsonify({'error': 'Failed to start stream'}), 500

@app.route('/api/streams/<stream_id>/stop', methods=['POST'])
def stop_stream(stream_id):
    """Stop monitoring a stream"""
    try:
        success = stream_manager.stop_stream(stream_id)
        
        if success:
            # Update database
            mongo.db.streams.update_one(
                {'streamId': stream_id},
                {'$set': {'status': 'stopped', 'stopTime': datetime.now(datetime.timezone.utc)}}
            )
            
            return jsonify({'message': 'Stream stopped successfully'})
        else:
            return jsonify({'error': 'Stream not found or already stopped'}), 404
            
    except Exception as e:
        logger.error(f"Error stopping stream {stream_id}: {str(e)}")
        return jsonify({'error': 'Failed to stop stream'}), 500

@app.route('/api/streams/<stream_id>/status', methods=['GET'])
def get_stream_status(stream_id):
    """Get stream status and statistics"""
    try:
        status = stream_manager.get_stream_status(stream_id)
        
        if status:
            return jsonify(status)
        else:
            # Check database for historical data
            stream = mongo.db.streams.find_one({'streamId': stream_id})
            if stream:
                return jsonify({
                    'status': 'inactive',
                    'lastKnown': serialize_doc(stream)
                })
            else:
                raise NotFound('Stream not found')
                
    except Exception as e:
        logger.error(f"Error getting stream status {stream_id}: {str(e)}")
        return jsonify({'error': 'Failed to get stream status'}), 500

# Settings Management Routes

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Get application settings"""
    try:
        settings = mongo.db.settings.find_one({'type': 'global'})
        if not settings:
            # Return default settings
            default_settings = {
                'type': 'global',
                'stream': {
                    'defaultQuality': '720p',
                    'defaultBitrate': 2000,
                    'defaultFrameRate': 30,
                    'autoReconnect': True,
                    'bufferSize': 3
                },
                'overlay': {
                    'maxOverlays': 10,
                    'defaultFont': 'Arial',
                    'enableAnimations': True
                },
                'ui': {
                    'theme': 'dark',
                    'enableNotifications': True,
                    'autoSave': True
                }
            }
            return jsonify(default_settings)
        
        return jsonify(serialize_doc(settings))
        
    except Exception as e:
        logger.error(f"Error fetching settings: {str(e)}")
        return jsonify({'error': 'Failed to fetch settings'}), 500

@app.route('/api/settings', methods=['PUT'])
def update_settings():
    """Update application settings"""
    try:
        data = request.json
        data['updatedAt'] = datetime.now(datetime.timezone.utc)
        
        mongo.db.settings.update_one(
            {'type': 'global'},
            {'$set': data},
            upsert=True
        )
        
        settings = mongo.db.settings.find_one({'type': 'global'})
        return jsonify(serialize_doc(settings))
        
    except Exception as e:
        logger.error(f"Error updating settings: {str(e)}")
        return jsonify({'error': 'Failed to update settings'}), 500

# Analytics and Reporting Routes

@app.route('/api/analytics/overview', methods=['GET'])
def get_analytics_overview():
    """Get analytics overview"""
    try:
        # Get counts
        total_overlays = mongo.db.overlays.count_documents({})
        active_overlays = mongo.db.overlays.count_documents({'isVisible': True})
        total_streams = mongo.db.streams.count_documents({})
        active_streams = len(stream_manager.active_streams)
        
        # Get recent activity
        recent_overlays = list(mongo.db.overlays.find({}).sort('createdAt', -1).limit(5))
        recent_streams = list(mongo.db.streams.find({}).sort('startTime', -1).limit(5))
        
        return jsonify({
            'summary': {
                'totalOverlays': total_overlays,
                'activeOverlays': active_overlays,
                'totalStreams': total_streams,
                'activeStreams': active_streams
            },
            'recentActivity': {
                'overlays': [serialize_doc(o) for o in recent_overlays],
                'streams': [serialize_doc(s) for s in recent_streams]
            },
            'systemStatus': {
                'uptime': 'OK',  # Could implement actual uptime tracking
                'memoryUsage': 'Normal',  # Could implement actual memory monitoring
                'activeConnections': active_streams
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching analytics: {str(e)}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500

# Database initialization
@app.route('/api/admin/init-db', methods=['POST'])
def init_database():
    """Initialize database with indexes and sample data"""
    try:
        # Create indexes
        mongo.db.overlays.create_index([('type', 1), ('isVisible', 1)])
        mongo.db.overlays.create_index([('createdAt', -1)])
        mongo.db.streams.create_index([('streamId', 1)], unique=True)
        mongo.db.streams.create_index([('status', 1)])
        
        logger.info("Database initialized successfully")
        return jsonify({'message': 'Database initialized successfully'})
        
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        return jsonify({'error': 'Failed to initialize database'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)