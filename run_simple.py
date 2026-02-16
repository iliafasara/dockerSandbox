# run_simple.py
import subprocess
import sys

# Установим зависимости если их нет
try:
    import flask
    print(f"✅ Flask уже установлен, версия: {flask.__version__}")
except ImportError:
    print("❌ Flask не найден, устанавливаем...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])

# Запустим основной файл
print("🚀 Запуск Python Sandbox...")
exec(open("app.py").read())