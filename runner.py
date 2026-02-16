#!/usr/bin/env python3
import sys
import json
import time
import traceback
import io

def safe_execute(code):
    """
    Безопасное выполнение Python кода
    """
    # Создаем контекст для выполнения
    output_buffer = io.StringIO()
    
    # Перехватываем вывод
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = output_buffer
    sys.stderr = output_buffer
    
    try:
        # Замеряем время выполнения
        start_time = time.time()
        
        # Выполняем код
        exec_globals = {
            '__builtins__': __builtins__,
            'print': print,
            'range': range,
            'len': len,
            'str': str,
            'int': int,
            'float': float,
            'list': list,
            'dict': dict,
            'tuple': tuple,
            'set': set,
            'bool': bool,
            'type': type,
            'enumerate': enumerate,
            'zip': zip,
            'sorted': sorted,
            'reversed': reversed,
            'min': min,
            'max': max,
            'sum': sum,
            'abs': abs,
            'round': round,
            'pow': pow,
            'divmod': divmod,
            'all': all,
            'any': any,
            'isinstance': isinstance,
            'issubclass': issubclass,
            'hasattr': hasattr,
            'getattr': getattr,
            'setattr': setattr,
        }
        
        # Ограничиваем время выполнения
        import threading
        result = None
        exception = None
        
        def execute():
            nonlocal result, exception
            try:
                result = exec(code, exec_globals)
            except Exception as e:
                exception = e
        
        thread = threading.Thread(target=execute)
        thread.start()
        thread.join(timeout=30)  # Таймаут 30 секунд
        
        if thread.is_alive():
            raise TimeoutError("Превышено время выполнения (30 секунд)")
        
        if exception:
            raise exception
        
        execution_time = time.time() - start_time
        
        # Получаем вывод
        output = output_buffer.getvalue()
        
        return {
            "success": True,
            "output": output,
            "error": "",
            "execution_time": round(execution_time, 3)
        }
        
    except TimeoutError as e:
        return {
            "success": False,
            "output": "",
            "error": str(e),
            "execution_time": 30
        }
    except Exception as e:
        # Форматируем ошибку
        error_msg = f"Ошибка выполнения: {type(e).__name__}: {str(e)}"
        return {
            "success": False,
            "output": "",
            "error": error_msg,
            "execution_time": 0
        }
    finally:
        # Восстанавливаем stdout/stderr
        sys.stdout = old_stdout
        sys.stderr = old_stderr

def main():
    """
    Основная функция для выполнения кода из контейнера
    """
    try:
        # Читаем ввод из stdin
        input_data = sys.stdin.read()
        
        if not input_data:
            print(json.dumps({
                "success": False,
                "output": "",
                "error": "Не получен код для выполнения",
                "execution_time": 0
            }))
            return
        
        # Парсим JSON
        try:
            data = json.loads(input_data)
            code = data.get('code', '')
        except json.JSONDecodeError:
            print(json.dumps({
                "success": False,
                "output": "",
                "error": "Некорректный JSON",
                "execution_time": 0
            }))
            return
        
        # Выполняем код
        result = safe_execute(code)
        
        # Выводим результат как JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "output": "",
            "error": f"Критическая ошибка контейнера: {str(e)}",
            "execution_time": 0
        }))

if __name__ == "__main__":
    main()