// Python Sandbox - Код слева, результат и ввод справа

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Python Sandbox запущен');
    
    // Элементы DOM
    const codeInput = document.getElementById('code-input');
    const outputHistory = document.getElementById('output-history');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');
    const loadExampleBtn = document.getElementById('load-example-btn');
    const examplesSelect = document.getElementById('examples-select');
    const instructionsBtn = document.getElementById('instructions-btn');
    const tryCalculatorBtn = document.getElementById('try-calculator-btn');
    const statusLabel = document.getElementById('status-label');
    const statusLight = document.getElementById('status-light');
    const executionTime = document.getElementById('execution-time');
    const codeLines = document.getElementById('code-lines');
    const securityStatus = document.getElementById('security-status');
    const userInput = document.getElementById('user-input');
    const submitInputBtn = document.getElementById('submit-input-btn');
    const currentPrompt = document.getElementById('current-prompt');
    const clearConsoleBtn = document.getElementById('clear-console-btn');
    const copyOutputBtn = document.getElementById('copy-output-btn');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const instructionsModal = document.getElementById('instructions-modal');
    const modalClose = document.querySelector('.modal-close');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    
    // Инициализация CodeMirror
    const editor = CodeMirror.fromTextArea(codeInput, {
        mode: 'python',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        smartIndent: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        viewportMargin: Infinity,
        extraKeys: {
            "Ctrl-Enter": function() { executeCode(); },
            "Cmd-Enter": function() { executeCode(); },
            "Ctrl-S": function() { saveCurrentCode(); },
            "Cmd-S": function() { saveCurrentCode(); },
            "Tab": function(cm) {
                cm.replaceSelection("    ", "end");
            }
        }
    });
    
    // Состояние приложения
    let appState = {
        autoSave: true,
        isRunning: false,
        isWaitingForInput: false,
        currentInputCallback: null,
        currentInputPrompt: '',
        executionQueue: [],
        variables: {},
        consoleMessagesCount: 0,
        examples: {
            'calculator': `# Пример калькулятора
print("=== КАЛЬКУЛЯТОР ===")

# Получаем числа от пользователя
num1 = float(input("Введите первое число: "))
num2 = float(input("Введите второе число: "))
operation = input("Выберите операцию (+, -, *, /): ")

# Выполняем операцию
if operation == '+':
    result = num1 + num2
    print(f"{num1} + {num2} = {result}")
elif operation == '-':
    result = num1 - num2
    print(f"{num1} - {num2} = {result}")
elif operation == '*':
    result = num1 * num2
    print(f"{num1} * {num2} = {result}")
elif operation == '/':
    if num2 != 0:
        result = num1 / num2
        print(f"{num1} / {num2} = {result}")
    else:
        print("Ошибка: деление на ноль!")
else:
    print("Неизвестная операция")

print("Готово!")`,
            
            'input_example': `# Пример работы с input()
print("=== РАБОТА С INPUT() ===")

# Простой input
name = input("Введите ваше имя: ")
print(f"Привет, {name}!")

# Input с числами
num1 = input("Введите первое число: ")
num2 = input("Введите второе число: ")

# Преобразуем в числа
num1 = float(num1)
num2 = float(num2)

print(f"Сумма: {num1} + {num2} = {num1 + num2}")
print(f"Произведение: {num1} * {num2} = {num1 * num2}")

# Множественный input
print("\\nВведите три числа через пробел:")
values = input().split()
numbers = [float(x) for x in values]
print(f"Вы ввели: {numbers}")
print(f"Сумма: {sum(numbers)}")`,
            
            'fibonacci': `# Числа Фибоначчи
print("=== ЧИСЛА ФИБОНАЧЧИ ===")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Получаем ввод от пользователя
n = int(input("Сколько чисел Фибоначчи вывести? "))

print(f"Первые {n} чисел Фибоначчи:")
for i in range(n):
    print(f"F({i}) = {fibonacci(i)}")`,
            
            'lists': `# Работа со списками
print("=== РАБОТА СО СПИСКАМИ ===")

# Создаем список
fruits = ["яблоко", "банан", "апельсин"]
print("Исходный список:", fruits)

# Добавляем элементы
new_fruit = input("Добавьте фрукт в список: ")
fruits.append(new_fruit)
print("После добавления:", fruits)

# Удаляем элемент
if len(fruits) > 1:
    remove_fruit = input(f"Какой фрукт удалить? (0-{len(fruits)-1}): ")
    index = int(remove_fruit)
    if 0 <= index < len(fruits):
        removed = fruits.pop(index)
        print(f"Удален: {removed}")
    else:
        print("Неверный индекс!")

print("Итоговый список:", fruits)
print("Количество элементов:", len(fruits))`
        }
    };
    
    // Инициализация
    function init() {
        console.log('Инициализация приложения...');
        
        // Загружаем сохраненный код
        loadSavedCode();
        
        // Настройка обработчиков событий
        setupEventListeners();
        
        // Обновляем счетчик строк
        updateCodeLines();
        
        updateStatus('Готов к работе', 'ready');
        
        // Очищаем консоль и добавляем одно приветственное сообщение
        outputHistory.innerHTML = '';
        appState.consoleMessagesCount = 0;
        
        addOutputLine('🚀 Python Sandbox v2.1 готов к работе!', 'system');
        addOutputLine('📝 Введите код слева и нажмите "Запустить код"', 'system');
        addOutputLine('💡 Для работы с input() используйте поле ввода ниже', 'system');
    }
    
    // Настройка обработчиков событий
    function setupEventListeners() {
        // Кнопка запуска кода
        runBtn.addEventListener('click', executeCode);
        
        // Кнопка очистки редактора
        clearBtn.addEventListener('click', function() {
            if (confirm('Очистить редактор кода?')) {
                editor.setValue('');
                localStorage.removeItem('python_sandbox_code');
                addOutputLine('🗑️ Редактор кода очищен', 'system');
                updateCodeLines();
                updateStatus('Готов', 'ready');
            }
        });
        
        // Кнопка сохранения
        saveBtn.addEventListener('click', saveCurrentCode);
        
        // Кнопка загрузки примера
        loadExampleBtn.addEventListener('click', loadExample);
        
        // Кнопка инструкции
        instructionsBtn.addEventListener('click', showInstructions);
        
        // Кнопка "Попробовать калькулятор"
        tryCalculatorBtn.addEventListener('click', function() {
            hideInstructions();
            loadExample('calculator');
            setTimeout(executeCode, 500);
        });
        
        // Закрытие модального окна
        modalClose.addEventListener('click', hideInstructions);
        closeModalBtn.addEventListener('click', hideInstructions);
        
        // Ввод данных для input()
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !appState.isWaitingForInput) {
                e.preventDefault();
                executeCode();
            } else if (e.key === 'Enter' && appState.isWaitingForInput) {
                e.preventDefault();
                submitUserInput();
            }
        });
        
        submitInputBtn.addEventListener('click', submitUserInput);
        
        // Примеры ввода
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                if (appState.isWaitingForInput) {
                    userInput.value = this.getAttribute('data-value');
                    submitUserInput();
                } else {
                    userInput.value = this.getAttribute('data-value');
                }
            });
        });
        
        // Очистка консоли
        clearConsoleBtn.addEventListener('click', function() {
            if (confirm('Очистить вывод консоли?')) {
                outputHistory.innerHTML = '';
                appState.consoleMessagesCount = 0;
                addOutputLine('Консоль очищена', 'system');
            }
        });
        
        // Копирование результата
        copyOutputBtn.addEventListener('click', function() {
            const outputText = Array.from(outputHistory.querySelectorAll('.output-line'))
                .map(line => line.textContent)
                .join('\n');
            
            navigator.clipboard.writeText(outputText).then(() => {
                const originalText = copyOutputBtn.innerHTML;
                copyOutputBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                setTimeout(() => {
                    copyOutputBtn.innerHTML = originalText;
                }, 2000);
            });
        });
        
        // Автосохранение
        autoSaveToggle.addEventListener('change', function() {
            appState.autoSave = this.checked;
            addOutputLine(`Автосохранение: ${this.checked ? 'ВКЛ' : 'ВЫКЛ'}`, 'system');
        });
        
        // Автосохранение при изменении кода
        editor.on('change', function() {
            updateCodeLines();
            if (appState.autoSave) {
                saveCodeToStorage();
            }
        });
        
        // Глобальные горячие клавиши
        document.addEventListener('keydown', function(e) {
            // Ctrl+L для очистки консоли
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                if (confirm('Очистить вывод консоли?')) {
                    outputHistory.innerHTML = '';
                    appState.consoleMessagesCount = 0;
                    addOutputLine('Консоль очищена', 'system');
                }
            }
            
            // Escape для закрытия модального окна
            if (e.key === 'Escape' && instructionsModal.classList.contains('show')) {
                hideInstructions();
            }
        });
    }
    
    // Выполнение кода
    async function executeCode() {
        if (appState.isRunning) {
            addOutputLine('⚠️ Код уже выполняется...', 'error');
            return;
        }
        
        const code = editor.getValue();
        
        if (!code.trim()) {
            addOutputLine('⚠️ Введите код для выполнения', 'error');
            return;
        }
        
        // Проверка безопасности
        if (!isCodeSafe(code)) {
            addOutputLine('❌ Код содержит опасные операции', 'error');
            securityStatus.textContent = '✗ Опасный код';
            securityStatus.style.color = '#ff4d4d';
            updateStatus('Ошибка безопасности', 'error');
            return;
        }
        
        appState.isRunning = true;
        appState.executionQueue = [];
        appState.variables = {};
        
        updateStatus('Выполнение...', 'running');
        runBtn.disabled = true;
        runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Выполнение...';
        
        const startTime = performance.now();
        
        // Добавляем разделитель перед новым запуском
        addOutputLine('══════════════════════════════════════════════════', 'system');
        addOutputLine('🚀 ЗАПУСК КОДА...', 'system');
        addOutputLine('══════════════════════════════════════════════════', 'system');
        
        // Разбиваем код на строки
        const lines = code.split('\n');
        let lineIndex = 0;
        
        // Функция выполнения следующей строки
        function executeNextLine() {
            if (lineIndex >= lines.length) {
                // Код завершен
                finishExecution(startTime);
                return;
            }
            
            const line = lines[lineIndex].trim();
            lineIndex++;
            
            // Пропускаем пустые строки и комментарии
            if (!line || line.startsWith('#')) {
                executeNextLine();
                return;
            }
            
            // Обрабатываем строку
            processLine(line).then(executeNextLine).catch(error => {
                addOutputLine(`❌ Ошибка в строке ${lineIndex}: ${error.message}`, 'error');
                finishExecution(startTime);
            });
        }
        
        // Начинаем выполнение
        executeNextLine();
    }
    
    // Обработка одной строки кода
    async function processLine(line) {
        return new Promise((resolve) => {
            // Задержка для визуального эффекта
            setTimeout(() => {
                try {
                    // Обработка print()
                    if (line.includes('print(')) {
                        handlePrint(line);
                    }
                    // Обработка input()
                    else if (line.includes('input(')) {
                        handleInput(line, resolve);
                        return; // Ждем ввода пользователя
                    }
                    // Обработка присваивания
                    else if (line.includes('=')) {
                        handleAssignment(line);
                    }
                    // Обработка других выражений
                    else if (line.trim()) {
                        handleExpression(line);
                    }
                    
                    resolve();
                } catch (error) {
                    addOutputLine(`❌ Ошибка: ${error.message}`, 'error');
                    resolve();
                }
            }, 30);
        });
    }
    
    // Обработка print()
    function handlePrint(line) {
        // Извлекаем содержимое print()
        const match = line.match(/print\(([^)]+)\)/);
        if (!match) return;
        
        let content = match[1];
        
        // Обработка f-строк
        if (content.startsWith('f"') || content.startsWith("f'")) {
            content = processFString(content);
        }
        
        // Удаляем кавычки
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
            content = content.substring(1, content.length - 1);
        }
        
        // Заменяем переменные
        for (const [varName, value] of Object.entries(appState.variables)) {
            const regex = new RegExp('\\b' + varName + '\\b', 'g');
            content = content.replace(regex, value);
        }
        
        addOutputLine(content, 'output');
    }
    
    // Обработка f-строк
    function processFString(fstr) {
        // Упрощенная обработка f-строк
        let result = fstr.substring(2, fstr.length - 1);
        
        // Заменяем выражения в {}
        result = result.replace(/\{([^}]+)\}/g, (match, expr) => {
            try {
                // Пробуем вычислить выражение
                return safeEval(expr.trim());
            } catch {
                // Если не получается, возвращаем значение переменной
                return appState.variables[expr.trim()] || `[${expr}]`;
            }
        });
        
        return '"' + result + '"';
    }
    
    // Обработка input()
    function handleInput(line, resolve) {
        // Извлекаем prompt из input()
        const match = line.match(/input\(['"]([^'"]*)['"]\)/);
        const prompt = match ? match[1] : 'Введите значение: ';
        
        // Сохраняем callback для продолжения выполнения
        appState.isWaitingForInput = true;
        appState.currentInputCallback = (value) => {
            // Сохраняем значение как переменную
            const varName = extractVariableName(line);
            if (varName) {
                appState.variables[varName] = value;
            }
            
            // Показываем введенное значение
            addOutputLine(`↳ ${value}`, 'input');
            
            // Продолжаем выполнение
            appState.isWaitingForInput = false;
            appState.currentInputCallback = null;
            currentPrompt.textContent = 'Готов к вводу...';
            userInput.disabled = true;
            submitInputBtn.disabled = true;
            userInput.value = '';
            
            resolve();
        };
        
        // Показываем prompt пользователю
        addOutputLine(`❓ ${prompt}`, 'prompt');
        currentPrompt.textContent = prompt;
        userInput.disabled = false;
        submitInputBtn.disabled = false;
        userInput.focus();
    }
    
    // Извлечение имени переменной из строки с присваиванием
    function extractVariableName(line) {
        const match = line.match(/(\w+)\s*=\s*input/);
        return match ? match[1] : null;
    }
    
    // Обработка присваивания
    function handleAssignment(line) {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const varName = parts[0].trim();
            let expression = parts.slice(1).join('=').trim();
            
            // Удаляем кавычки у строк
            if ((expression.startsWith('"') && expression.endsWith('"')) || 
                (expression.startsWith("'") && expression.endsWith("'"))) {
                appState.variables[varName] = expression.substring(1, expression.length - 1);
            }
            // Обработка чисел
            else if (/^-?\d*\.?\d+$/.test(expression)) {
                appState.variables[varName] = parseFloat(expression);
            }
            // Обработка выражений
            else {
                try {
                    // Заменяем переменные в выражении
                    for (const [name, value] of Object.entries(appState.variables)) {
                        const regex = new RegExp('\\b' + name + '\\b', 'g');
                        expression = expression.replace(regex, typeof value === 'string' ? `"${value}"` : value);
                    }
                    
                    // Вычисляем выражение
                    const result = safeEval(expression);
                    appState.variables[varName] = result;
                } catch (error) {
                    appState.variables[varName] = expression;
                }
            }
        }
    }
    
    // Обработка выражения
    function handleExpression(line) {
        try {
            // Заменяем переменные
            let expression = line;
            for (const [name, value] of Object.entries(appState.variables)) {
                const regex = new RegExp('\\b' + name + '\\b', 'g');
                expression = expression.replace(regex, typeof value === 'string' ? `"${value}"` : value);
            }
            
            // Пробуем вычислить
            const result = safeEval(expression);
            if (result !== undefined) {
                appState.variables['_'] = result; // Сохраняем в специальную переменную
            }
        } catch (error) {
            // Игнорируем ошибки вычисления
        }
    }
    
    // Безопасное вычисление выражений
    function safeEval(expr) {
        try {
            // Удаляем лишние пробелы
            expr = expr.trim();
            
            // Проверяем на опасные операции
            const dangerous = ['import', 'eval', 'exec', 'open', 'os.', 'sys.', '__'];
            for (const d of dangerous) {
                if (expr.toLowerCase().includes(d)) {
                    throw new Error('Небезопасная операция');
                }
            }
            
            // Используем Function для безопасного вычисления
            return Function('"use strict"; return (' + expr + ')')();
        } catch (error) {
            throw new Error('Не удалось вычислить выражение: ' + error.message);
        }
    }
    
    // Проверка безопасности кода
    function isCodeSafe(code) {
        const dangerousPatterns = [
            'import os', 'import sys', 'import subprocess',
            '__import__', 'eval(', 'exec(', 'compile(',
            'open(', 'os.', 'sys.', 'subprocess.',
            'while True:', 'while 1:'
        ];
        
        for (const pattern of dangerousPatterns) {
            if (code.toLowerCase().includes(pattern.toLowerCase())) {
                return false;
            }
        }
        
        return true;
    }
    
    // Отправка введенных данных
    function submitUserInput() {
        if (!appState.isWaitingForInput || !appState.currentInputCallback) {
            return;
        }
        
        const value = userInput.value.trim();
        if (value === '') {
            return;
        }
        
        appState.currentInputCallback(value);
    }
    
    // Завершение выполнения
    function finishExecution(startTime) {
        const execTime = (performance.now() - startTime) / 1000;
        
        executionTime.textContent = execTime.toFixed(3) + ' сек';
        securityStatus.textContent = '✓ Безопасно';
        securityStatus.style.color = '#00ff88';
        
        addOutputLine('══════════════════════════════════════════════════', 'system');
        addOutputLine(`✅ Выполнение завершено за ${execTime.toFixed(3)} сек`, 'success');
        
        appState.isRunning = false;
        runBtn.disabled = false;
        runBtn.innerHTML = '<i class="fas fa-play"></i> Запустить код';
        updateStatus('Готов', 'ready');
        
        // Очистка старых сообщений если их слишком много
        cleanupConsole();
    }
    
    // Загрузка примера
    function loadExample(key) {
        if (!key) {
            key = examplesSelect.value;
            if (!key) {
                addOutputLine('⚠️ Выберите пример из списка', 'error');
                return;
            }
        }
        
        if (appState.examples[key]) {
            editor.setValue(appState.examples[key]);
            
            const exampleNames = {
                'calculator': 'Калькулятор',
                'input_example': 'Работа с input()',
                'fibonacci': 'Числа Фибоначчи',
                'lists': 'Работа со списками'
            };
            
            addOutputLine(`📂 Загружен пример: ${exampleNames[key]}`, 'system');
            updateCodeLines();
            updateStatus('Пример загружен', 'ready');
            
            // Автоматически выбираем в выпадающем списке
            examplesSelect.value = key;
        } else {
            addOutputLine('❌ Пример не найден', 'error');
        }
    }
    
    // Сохранение кода
    function saveCurrentCode() {
        saveCodeToStorage();
        
        // Анимация подтверждения
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Сохранено!';
        saveBtn.style.background = '#1a5a1a';
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.style.background = '';
        }, 1500);
        
        addOutputLine('💾 Код сохранен', 'system');
    }
    
    function saveCodeToStorage() {
        const code = editor.getValue();
        localStorage.setItem('python_sandbox_code', code);
    }
    
    // Загрузка сохраненного кода
    function loadSavedCode() {
        const savedCode = localStorage.getItem('python_sandbox_code');
        if (savedCode) {
            editor.setValue(savedCode);
            updateCodeLines();
        }
    }
    
    // Обновление счетчика строк
    function updateCodeLines() {
        const lines = editor.getValue().split('\n').length;
        codeLines.textContent = lines;
    }
    
    // Добавление строки в вывод
    function addOutputLine(text, type = 'output') {
        const line = document.createElement('div');
        line.className = `output-line ${type}`;
        line.textContent = text;
        
        outputHistory.appendChild(line);
        appState.consoleMessagesCount++;
        
        // Автопрокрутка
        outputHistory.scrollTop = outputHistory.scrollHeight;
    }
    
    // Очистка старых сообщений из консоли
    function cleanupConsole() {
        if (appState.consoleMessagesCount > 50) {
            const lines = outputHistory.querySelectorAll('.output-line');
            const toRemove = appState.consoleMessagesCount - 30;
            
            for (let i = 0; i < toRemove && i < lines.length; i++) {
                lines[i].remove();
                appState.consoleMessagesCount--;
            }
        }
    }
    
    // Обновление статуса
    function updateStatus(text, type) {
        statusLabel.textContent = text;
        statusLight.className = 'status-light ' + type;
    }
    
    // Показать инструкцию
    function showInstructions() {
        instructionsModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    // Скрыть инструкцию
    function hideInstructions() {
        instructionsModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // Запуск инициализации
    init();
    
    // Экспорт глобальных функций
    window.pythonSandbox = {
        runCode: executeCode,
        saveCode: saveCurrentCode,
        clearCode: function() {
            editor.setValue('');
            localStorage.removeItem('python_sandbox_code');
            addOutputLine('Редактор очищен', 'system');
        },
        loadExample: loadExample
    };
    
    console.log('✅ Python Sandbox готов к работе');
});