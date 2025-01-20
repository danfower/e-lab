from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///inventory.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the Stock model
class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    min_threshold = db.Column(db.Integer, nullable=False)

# Initialize the database
db.create_all()

# Route to add a new stock item
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

# Route to get all stock items
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

# Route to update stock quantity
@app.route('/update_stock/<int:stock_id>', methods=['PUT'])
def update_stock(stock_id):
    data = request.get_json()
    stock_item = Stock.query.get(stock_id)
    if not stock_item:
        return jsonify({'message': 'Stock item not found'}), 404

    stock_item.quantity = data['quantity']
    db.session.commit()
    return jsonify({'message': 'Stock quantity updated successfully!'}), 200

# Route to check low stock and send reminders
@app.route('/check_low_stock', methods=['GET'])
def check_low_stock():
    low_stock_items = Stock.query.filter(Stock.quantity < Stock.min_threshold).all()
    if low_stock_items:
        send_email_reminder(low_stock_items)
    
    result = [
        {
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'min_threshold': item.min_threshold
        } for item in low_stock_items
    ]
    return jsonify(result), 200

# Function to send email reminders
def send_email_reminder(low_stock_items):
    sender_email = "your_email@example.com"
    sender_password = "your_password"
    recipient_email = "recipient_email@example.com"

    subject = "Low Stock Alert"
    body = "The following items are below the minimum threshold:\n\n"
    for item in low_stock_items:
        body += f"- {item.name}: {item.quantity} remaining (Minimum: {item.min_threshold})\n"

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.example.com', 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, recipient_email, msg.as_string())
        print("Low stock email reminder sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == '__main__':
    app.run(debug=True)
