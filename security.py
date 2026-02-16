import re

class CodeSecurity:
    """Класс для проверки безопасности Python кода"""
    
    # Запрещенные ключевые слова и конструкции
    FORBIDDEN_KEYWORDS = [
        '__import__', 'eval', 'exec', 'compile', 'open',
        'file', 'execfile', 'reload', 'input', 'raw_input',
        'globals', 'locals', 'vars', 'dir'
    ]
    
    # Запрещенные модули
    FORBIDDEN_MODULES = [
        'os', 'sys', 'subprocess', 'shutil', 'socket',
        'requests', 'urllib', 'webbrowser', 'ctypes',
        'multiprocessing', 'threading', 'signal'
    ]
    
    # Опасные паттерны
    DANGEROUS_PATTERNS = [
        (r'import\s+(os|sys|subprocess)', 'Dangerous module import'),
        (r'from\s+(os|sys|subprocess)', 'Dangerous module import'),
        (r'__.*__', 'Dunder method access'),
        (r'\.connect\(', 'Network connection'),
        (r'socket\.', 'Socket operations'),
        (r'open\(', 'File operations'),
        (r'exec\(', 'Dynamic code execution'),
        (r'eval\(', 'Dynamic code evaluation'),
        (r'input\(', 'User input'),
        (r'while\s+True:', 'Infinite loop'),
        (r'import\s*\(', 'Dynamic import'),
    ]
    
    # Максимальные ограничения
    MAX_CODE_LENGTH = 10000  # символов
    MAX_LINE_LENGTH = 200    # символов на строку
    MAX_LINES = 100          # строк кода
    
    @classmethod
    def is_code_safe(cls, code: str) -> tuple:
        """
        Проверяет код на безопасность
        
        Returns:
            (is_safe: bool, reason: str)
        """
        # Проверка 1: Пустой код
        if not code or not code.strip():
            return True, "Empty code"
        
        # Проверка 2: Длина кода
        if len(code) > cls.MAX_CODE_LENGTH:
            return False, f"Code too long (max {cls.MAX_CODE_LENGTH} chars)"
        
        lines = code.split('\n')
        
        # Проверка 3: Количество строк
        if len(lines) > cls.MAX_LINES:
            return False, f"Too many lines (max {cls.MAX_LINES})"
        
        # Проверка 4: Длина строк
        for i, line in enumerate(lines, 1):
            if len(line) > cls.MAX_LINE_LENGTH:
                return False, f"Line {i} too long (max {cls.MAX_LINE_LENGTH} chars)"
        
        # Проверка 5: Запрещенные ключевые слова
        for keyword in cls.FORBIDDEN_KEYWORDS:
            if keyword in code:
                return False, f"Forbidden keyword: {keyword}"
        
        # Проверка 6: Запрещенные модули в import
        for module in cls.FORBIDDEN_MODULES:
            # Проверяем import module
            import_pattern = rf'import\s+{module}\b'
            if re.search(import_pattern, code, re.IGNORECASE):
                return False, f"Forbidden module import: {module}"
            
            # Проверяем from module import
            from_pattern = rf'from\s+{module}\s+import'
            if re.search(from_pattern, code, re.IGNORECASE):
                return False, f"Forbidden module import: {module}"
        
        # Проверка 7: Опасные паттерны
        for pattern, description in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, code, re.IGNORECASE):
                return False, f"Dangerous pattern: {description}"
        
        # Проверка 8: Попытка обхода ограничений через строки
        suspicious_strings = [
            'os.', 'sys.', 'subprocess.', '__import__',
            'eval(', 'exec(', 'open('
        ]
        
        code_lower = code.lower()
        for suspicious in suspicious_strings:
            if suspicious in code_lower:
                return False, f"Suspicious code detected: {suspicious}"
        
        return True, "Code is safe"
    
    @classmethod
    def sanitize_code(cls, code: str) -> str:
        """
        Очищает код от потенциально опасных конструкций
        
        Returns:
            Очищенный код
        """
        lines = code.split('\n')
        sanitized_lines = []
        
        for line in lines:
            # Удаляем комментарии с потенциально опасным содержимым
            if '#' in line:
                comment_start = line.index('#')
                comment = line[comment_start:]
                line_without_comment = line[:comment_start]
                
                # Проверяем комментарий на опасные слова
                dangerous_in_comment = False
                for keyword in cls.FORBIDDEN_KEYWORDS + cls.FORBIDDEN_MODULES:
                    if keyword in comment:
                        dangerous_in_comment = True
                        break
                
                if dangerous_in_comment:
                    line = line_without_comment
            
            # Добавляем очищенную строку
            sanitized_lines.append(line)
        
        return '\n'.join(sanitized_lines)


# Тестирование безопасности
if __name__ == "__main__":
    test_cases = [
        ("print('Hello')", True),
        ("import os", False),
        ("eval('1+1')", False),
        ("x = open('test.txt')", False),
        ("while True: pass", False),
        ("from subprocess import run", False),
        ("import math\nprint(math.sqrt(16))", True),
        ("x = [1, 2, 3]\nfor i in x: print(i)", True),
    ]
    
    print("Security Test Results:")
    print("=" * 60)
    
    for code, expected_safe in test_cases:
        is_safe, reason = CodeSecurity.is_code_safe(code)
        status = "✓ PASS" if is_safe == expected_safe else "✗ FAIL"
        print(f"{status} | Expected: {expected_safe} | Got: {is_safe}")
        print(f"  Code: {code[:40]}...")
        print(f"  Reason: {reason}")
        print("-" * 60)