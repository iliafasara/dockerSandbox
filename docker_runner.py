import subprocess
import time
import json
import os
from typing import Dict, Any

class DockerCodeRunner:

    
    def __init__(self, use_docker=True):

        self.use_docker = use_docker
        self.docker_available = self._check_docker()
        
        print(f"DockerRunner initialized: use_docker={use_docker}, docker_available={self.docker_available}")
        
    def _check_docker(self) -> bool:
        try:
            result = subprocess.run(
                ['docker', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def run_code(self, code: str, timeout: int = 10) -> Dict[str, Any]:

        if self.use_docker and self.docker_available:
            return self._run_with_docker(code, timeout)
        else:
            return self._run_with_sandbox(code, timeout)
    
    def _run_with_docker(self, code: str, timeout: int) -> Dict[str, Any]:
        try:
            # Подготавливаем код
            safe_code = self._prepare_code_for_docker(code)
            
            # Команда для Docker
            docker_cmd = [
                'docker', 'run',
                '--rm',  # Удалить контейнер после выполнения
                '--memory=100m',  # Ограничение памяти
                '--cpus=0.5',  # Ограничение CPU
                '--network=none',  # Без сети
                '--read-only',  # Только для чтения
                'python:3.9-alpine',
                'python', '-c', safe_code
            ]
            
            start_time = time.time()
            
            # Запускаем Docker контейнер
            process = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding='utf-8'
            )
            
            execution_time = time.time() - start_time
            
            if process.returncode == 0:
                return {
                    "success": True,
                    "output": process.stdout,
                    "error": process.stderr,
                    "execution_time": round(execution_time, 3)
                }
            else:
                return {
                    "success": False,
                    "output": "",
                    "error": process.stderr or f"Docker exited with code {process.returncode}",
                    "execution_time": round(execution_time, 3)
                }
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": f"Timeout: code execution exceeded {timeout} seconds",
                "execution_time": timeout
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Docker error: {str(e)}",
                "execution_time": 0
            }
    
    def _run_with_sandbox(self, code: str, timeout: int) -> Dict[str, Any]:
        try:
            # Создаем безопасное окружение
            safe_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'range': range,
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
                },
                'print': print,
                'range': range,
                'len': len
            }
            
            # Захватываем вывод
            import io
            import sys
            
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            
            output = io.StringIO()
            sys.stdout = output
            sys.stderr = output
            
            # Выполняем код с таймаутом
            import threading
            
            result = None
            error = None
            
            def execute():
                nonlocal result, error
                try:
                    exec(code, safe_globals)
                    result = output.getvalue()
                except Exception as e:
                    error = e
            
            thread = threading.Thread(target=execute)
            thread.start()
            thread.join(timeout=timeout)
            
            sys.stdout = old_stdout
            sys.stderr = old_stderr
            
            execution_time = min(timeout, 0.1)  # Примерное время
            
            if thread.is_alive():
                return {
                    "success": False,
                    "output": "",
                    "error": f"Timeout: execution exceeded {timeout} seconds",
                    "execution_time": execution_time
                }
            
            if error:
                return {
                    "success": False,
                    "output": "",
                    "error": f"{type(error).__name__}: {str(error)}",
                    "execution_time": execution_time
                }
            
            return {
                "success": True,
                "output": result or "",
                "error": "",
                "execution_time": execution_time
            }
            
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": f"Sandbox error: {str(e)}",
                "execution_time": 0
            }
    
    def _prepare_code_for_docker(self, code: str) -> str:
        # Экранируем кавычки и переносы строк
        escaped_code = code.replace('\\', '\\\\').replace('"', '\\"').replace("'", "\\'")
        
        # Ограничиваем длину команды
        if len(escaped_code) > 8000:
            escaped_code = escaped_code[:8000] + "\nprint('Code truncated due to length limits')"
        
        return escaped_code


# Тестирование
if __name__ == "__main__":
    runner = DockerCodeRunner(use_docker=False)
    
    test_cases = [
        "print('Hello, Docker!')",
        "for i in range(3): print(i)",
        "x = [1, 2, 3]\nprint('List:', x)"
    ]
    
    for test_code in test_cases:
        print(f"\nTesting: {test_code[:50]}...")
        result = runner.run_code(test_code)
        print(f"Result: {result}")
