let isOn = true;
let isFraction = false;
let mode = 'RAD';
let isResultDisplayed = false;
let isShiftActive = false;

function clearDisplay() {
    document.getElementById("display").value = "";
}

function deleteLastCharacter() {
    let display = document.getElementById("display");
    display.value = display.value.slice(0, -1);
}

function resetCalculator() {
    localStorage.removeItem("calculatorMemory");
    clearDisplay();
    isResultDisplayed = false; // Reset result display flag
}

function addToDisplay(value) {
    let display = document.getElementById("display");

    if (!isOn) return;

    if (isResultDisplayed && !isArithmeticSign(value)) {
        clearDisplay();
        isResultDisplayed = false;
    }

    if (isShiftActive) {
        value = getShiftedValue(value);
        isShiftActive = false;
        resetShiftButton();
    }

    if (value === 'Ans') {
        display.value += 'Ans';
        isResultDisplayed = false;
    } else if (value === 'π') {
        display.value += 'π';
    } else if (value === 'x²') {
        display.value += '²';
    } else if (value === '3√') {
        display.value += '∛(';
    } else if (value === 'RAD' || value === 'DEG') {
        toggleMode();
    } else if (value === 'nCr' || value === 'nPr') {
        let currentValue = display.value;
        if (currentValue && !isNaN(currentValue.slice(-1))) {
            display.value += (value === 'nCr') ? 'C' : 'P';
        }
    } else if (value === 'S=>D') {
        toggleFractionDecimal();
    } else {
        display.value += value;
        isResultDisplayed = false;
    }
}

function isArithmeticSign(value) {
    return ['+', '-', '*', '/', '%'].includes(value);
}

function getShiftedValue(value) {
    switch (value) {
        case 'sin(': return 'arcsin(';
        case 'cos(': return 'arccos(';
        case 'tan(': return 'arctan(';
        case 'log(': return 'antilog(';
        default: return value;
    }
}

function calculate() {
    if (!isOn) return;

    let displayValue = document.getElementById("display").value;

    let lastAnswer = localStorage.getItem("calculatorMemory");
    if (lastAnswer) {
        displayValue = displayValue.replace(/(\d)Ans/g, '$1*Ans');
        displayValue = displayValue.replace(/Ans/g, lastAnswer);
    } else {
        displayValue = displayValue.replace(/Ans/g, '0');
    }

    displayValue = displayValue.replace(/sin/g, 'customSin');
    displayValue = displayValue.replace(/cos/g, 'customCos');
    displayValue = displayValue.replace(/tan/g, 'customTan');
    displayValue = displayValue.replace(/arcsin/g, 'customArcsin');
    displayValue = displayValue.replace(/arccos/g, 'customArccos');
    displayValue = displayValue.replace(/arctan/g, 'customArctan');
    displayValue = displayValue.replace(/antilog/g, 'customAntilog');
    displayValue = displayValue.replace(/√/g, 'Math.sqrt');
    displayValue = displayValue.replace(/(\d)π/g, '$1*Math.PI');
    displayValue = displayValue.replace(/π/g, 'Math.PI');
    displayValue = displayValue.replace(/e/g, 'Math.E');
    displayValue = displayValue.replace(/\^/g, '**');
    displayValue = displayValue.replace(/%/g, '/100');
    displayValue = displayValue.replace(/(\d+)!/g, function(match, p1) {
        return factorial(parseInt(p1));
    });
    displayValue = displayValue.replace(/(\d+)P(\d+)/g, function(match, p1, p2) {
        return permutation(parseInt(p1), parseInt(p2));
    });
    displayValue = displayValue.replace(/(\d+)C(\d+)/g, function(match, p1, p2) {
        return combination(parseInt(p1), parseInt(p2));
    });
    displayValue = displayValue.replace(/log/g, 'Math.log10');
    displayValue = displayValue.replace(/²/g, '**2');
    displayValue = displayValue.replace(/∛\(([^)]+)\)/g, 'Math.cbrt($1)');

    try {
        let result = eval(displayValue);
        document.getElementById("display").value = result;
        localStorage.setItem("calculatorMemory", result);
        isFraction = false;
        isResultDisplayed = true;
    } catch (e) {
        document.getElementById("display").value = "Error";
    }
}

function toggleOnOff() {
    let display = document.getElementById("display");
    if (isOn) {
        display.disabled = true;
        display.style.backgroundColor = "black";
        display.style.color = "white";
        clearDisplay();
    } else {
        display.disabled = false;
        display.style.backgroundColor = "white";
        display.style.color = "black";
    }
    isOn = !isOn;
}

function loadMemory() {
    let memory = localStorage.getItem("calculatorMemory");
    if (memory) {
        document.getElementById("display").value = memory;
    } else {
        clearDisplay();
    }
}

function resetShiftButton() {
    let shiftButton = document.querySelector('button[onclick="toggleShift()"]');
    shiftButton.style.backgroundColor = "";
}

function toggleFractionDecimal() {
    let display = document.getElementById("display");
    if (isFraction) {
        let fraction = display.value.split('/');
        if (fraction.length === 2) {
            let decimal = parseFloat(fraction[0]) / parseFloat(fraction[1]);
            display.value = decimal;
        } else {
            display.value = "Error";
        }
    } else {
        let value = parseFloat(display.value);
        if (!isNaN(value)) {
            let fraction = toFraction(value);
            display.value = fraction;
        } else {
            display.value = "Error";
        }
    }
    isFraction = !isFraction;
}

function toFraction(value) {
    let tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = value;

    do {
        let a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(value - h1 / k1) > value * tolerance);

    return h1 + "/" + k1;
}

function toggleMode() {
    let modeElement = document.getElementById("mode");
    mode = (mode === 'RAD') ? 'DEG' : 'RAD';
    modeElement.textContent = mode;
}

function customSin(x) {
    return (mode === 'RAD') ? Math.sin(x) : Math.sin(x * (Math.PI / 180));
}

function customCos(x) {
    return (mode === 'RAD') ? Math.cos(x) : Math.cos(x * (Math.PI / 180));
}

function customTan(x) {
    return (mode === 'RAD') ? Math.tan(x) : Math.tan(x * (Math.PI / 180));
}

function customArcsin(x) {
    if (x < -1 || x > 1) return NaN; // Handle out of range input
    return (mode === 'RAD') ? Math.asin(x) : Math.asin(x) * (180 / Math.PI);
}

function customArccos(x) {
    if (x < -1 || x > 1) return NaN; // Handle out of range input
    return (mode === 'RAD') ? Math.acos(x) : Math.acos(x) * (180 / Math.PI);
}

function customArctan(x) {
    return (mode === 'RAD') ? Math.atan(x) : Math.atan(x * (180 / Math.PI));
}

function customAntilog(x) {
    return Math.pow(10, x);
}

function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function permutation(n, r) {
    if (n < r) return "Error"; // Handle invalid input
    let result = 1;
    for (let i = 0; i < r; i++) {
        result *= (n - i);
    }
    return result;
}

function combination(n, r) {
    if (n < r) return "Error"; // Handle invalid input
    return permutation(n, r) / factorial(r);
}

function toggleShift() {
    isShiftActive = !isShiftActive;
    let shiftButton = document.querySelector('button[onclick="toggleShift()"]');
    if (isShiftActive) {
        shiftButton.style.backgroundColor = "yellow";
    } else {
        shiftButton.style.backgroundColor = "";
    }
}

window.onload = loadMemory;
