import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.transactions import transactions_bp
from routes.budgets import budgets_bp
from routes.categories import categories_bp
from routes.dashboard import dashboard_bp
from routes.analytics import analytics_bp

def create_app():
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    app.config.from_object(Config)

    # Enable CORS for all routes (supports frontend localhost calls)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(budgets_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(analytics_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': app.config['DB_NAME'],
            'server': app.config['DB_SERVER']
        }), 200

    # Serve existing frontend static files & pages
    @app.route('/')
    def serve_index():
        return send_from_directory(frontend_dir, 'index.html')

    @app.route('/<path:path>')
    def serve_frontend_files(path):
        target_path = os.path.join(frontend_dir, path)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')

    return app

app = create_app()

if __name__ == '__main__':
    print(f"Starting Flask backend for PersonalFinanceDB on http://127.0.0.1:5000...")
    app.run(host='127.0.0.1', port=5000, debug=True)
