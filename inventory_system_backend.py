from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure the database
database_url = os.getenv('DATABASE_URL', 'sqlite:///inventory.db')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://")
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db = SQLAlchemy(app)

# Define the Stock model
class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    min_threshold = db.Column(db.Integer, nullable=False)

# Home route
@app.route('/')
def home():
    return "Inventory Management System is running!"

# Add a new stock item
@app.route('/add_stock', methods=['POST'])
def add_stock():
    data = request.get_json()
    new_item = Stock(
        name=data['name'],
        category=data.get('category', ''),
        quantity=data['quantity'],
        min_threshold=data['min_threshold']
    )
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Stock item added successfully!'}), 201

# Retrieve all stock items
@app.route('/get_stock', methods=['GET'])
def get_stock():
    stock_items = Stock.query.all()
    result = [
        {
            'id': item.id,
            'name': item.name,
            'category': item.category,
            'quantity': item.quantity,
            'min_threshold': item.min_threshold
        } for item in stock_items
    ]
    return jsonify(result), 200

# Update the quantity of a stock item
@app.route('/update_stock/<int:stock_id>', methods=['PUT'])
def update_stock(stock_id):
    data = request.get_json()
    stock_item = Stock.query.get(stock_id)
    if not stock_item:
        return jsonify({'message': 'Stock item not found'}), 404

    stock_item.quantity = data['quantity']
    db.session.commit()
    return jsonify({'message': 'Stock quantity updated successfully!'}), 200

# Use a specified quantity of stock
@app.route('/use_stock/<int:stock_id>', methods=['PUT'])
def use_stock(stock_id):
    data = request.get_json()
    stock_item = Stock.query.get(stock_id)
    if not stock_item:
        return jsonify({'message': 'Stock item not found'}), 404

    use_quantity = data.get('quantity', 0)
    if not isinstance(use_quantity, int) or use_quantity <= 0:
        return jsonify({'message': 'Invalid quantity to use.'}), 400

    if stock_item.quantity < use_quantity:
        return jsonify({'message': 'Not enough stock available'}), 400

    stock_item.quantity -= use_quantity
    db.session.commit()
    return jsonify({'message': f'Used {use_quantity} units of {stock_item.name} successfully!'}), 200

# Remove a stock item
@app.route('/remove_stock/<int:stock_id>', methods=['DELETE'])
def remove_stock(stock_id):
    stock_item = Stock.query.get(stock_id)
    if not stock_item:
        return jsonify({'message': 'Stock item not found'}), 404

    db.session.delete(stock_item)
    db.session.commit()
    return jsonify({'message': f'Stock item {stock_item.name} removed successfully!'}), 200

# Retrieve low stock items
@app.route('/check_low_stock', methods=['GET'])
def check_low_stock():
    low_stock_items = Stock.query.filter(Stock.quantity < Stock.min_threshold).all()
    result = [
        {
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'min_threshold': item.min_threshold
        } for item in low_stock_items
    ]
    return jsonify(result), 200

# Filter stock by category
@app.route('/filter_stock/<string:category>', methods=['GET'])
def filter_stock(category):
    filtered_items = Stock.query.filter(Stock.category.ilike(f'%{category}%')).all()
    result = [
        {
            'id': item.id,
            'name': item.name,
            'category': item.category,
            'quantity': item.quantity,
            'min_threshold': item.min_threshold
        } for item in filtered_items
    ]
    return jsonify(result), 200

@app.route('/get_categories', methods=['GET'])
def get_categories():
    categories = Stock.query.with_entities(Stock.category).distinct().all()
    category_list = [category[0] for category in categories if category[0]]  # Extract non-empty categories
    return jsonify(category_list)
    
@app.route('/run_migrations', methods=['GET'])
def run_migrations():
    try:
        db.create_all()  # This will create any missing tables
        return jsonify({"message": "Database migrations completed successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
