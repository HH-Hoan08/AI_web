import mysql.connector
import os
from dotenv import load_dotenv
from pathlib import Path

#load file bảo mật
path = Path(__file__).resolve().parent.parent / 'env' / 'ad.env'
load_dotenv(dotenv_path=path)

class Database:
    @staticmethod
    def get_connect():
        if not os.getenv('DB_HOST'):
                print("Lỗi: Không tìm thấy file .env hoặc file trống!")
                return None
        try:
            return mysql.connector.connect(
                host=os.getenv('DB_HOST'),
                database=os.getenv('DB_NAME'),
                user=os.getenv('DB_USER'),
                password=os.getenv('DB_PASS'),
                port=os.getenv('DB_PORT')
            )
        except Exception as e:
            print(f"Lỗi {e}")
            return None

#Test in
#here (NOT TESTING IN MAIN IF NOTWORK)
if __name__ == "__main__":
    kho = Database.get_connect()
    print(kho)