from services.repositories.Kho import Database
from fastapi import FastAPI
import mysql.connector

class ProductRepository:
    try:
        def __init__(self, db_connection):
            self.db = db_connection
            
        def get_product(self):
            cursor = self.db.cursor()
            prompt = '''SELECT * FROM products'''
            cursor.execute(prompt)
            return cursor.fetchall()
        
    except Exception as e:
        print(f"Lỗi {e}")
if __name__ == "__main__":
    db_connection = Database.get_connect()
    ProductRepository = ProductRepository(db_connection)
    get_product = ProductRepository.get_product()
    print(get_product)
    