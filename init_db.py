from inventory_system_backend import app, db

# Create tables in the database
with app.app_context():
    db.create_all()
    print("Tables created successfully!")
