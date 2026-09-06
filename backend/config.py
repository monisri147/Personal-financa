import os
import urllib.parse

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'super-secret-personal-finance-key-32-chars-long')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-personal-finance-key-32-chars-long')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds
    
    DB_SERVER = os.environ.get('DB_SERVER', r'localhost\SQLEXPRESS')
    DB_NAME = os.environ.get('DB_NAME', 'PersonalFinanceDB')
    
    # Connection string for SQL Server with Windows Authentication
    odbc_str = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_NAME};"
        f"Trusted_Connection=yes;"
        f"TrustServerCertificate=yes;"
    )
    params = urllib.parse.quote_plus(odbc_str)
    SQLALCHEMY_DATABASE_URI = f"mssql+pyodbc:///?odbc_connect={params}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
