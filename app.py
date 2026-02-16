from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import time

app = Flask(__name__, static_folder='.')
CORS(app)

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if os.path.exists(filename):
        return send_from_directory('.', filename)
    return "File not found", 404

@app.route('/api/run', methods=['POST'])
def run_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        # Простая эмуляция выполнения (для тестирования)
        # В реальном проекте здесь будет Docker или безопасный runner
        
        if 'dangerous' in code.lower():
            return jsonify({
                "success": False,
                "output": "",
                "error": "Обнаружен опасный код",
                "execution_time": 0.1
            })
        
        # Эмулируем выполнение простого кода
        if 'print(' in code:
            return jsonify({
                "success": True,
                "output": "Hello from Python Sandbox!\nCode executed successfully.",
                "error": "",
                "execution_time": 0.2
            })
        
        return jsonify({
            "success": True,
            "output": "Код выполнен успешно (без вывода)",
            "error": "",
            "execution_time": 0.1
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "output": "",
            "error": f"Server error: {str(e)}",
            "execution_time": 0
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": time.time()
    })

if __name__ == '__main__':
    print("Starting Python Sandbox server...")
    print("Open http://localhost:5000 in your browser")
    app.run(host='0.0.0.0', port=5000, debug=True)