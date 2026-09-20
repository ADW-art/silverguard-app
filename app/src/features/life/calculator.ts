export type CalculatorOperator = '+' | '-' | '×' | '÷';

export interface CalculatorState {
  display: string;
  storedValue: number | null;
  operator: CalculatorOperator | null;
  waitingForOperand: boolean;
  error: boolean;
}

export function createCalculatorState(): CalculatorState {
  return { display: '0', storedValue: null, operator: null, waitingForOperand: false, error: false };
}

function readable(value: number): string {
  if (!Number.isFinite(value)) return '无法计算';
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  const text = String(rounded);
  return text.length <= 12 ? text : rounded.toExponential(6);
}

function evaluate(left: number, right: number, operator: CalculatorOperator): number {
  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '×') return left * right;
  return right === 0 ? Number.NaN : left / right;
}

export function inputCalculatorDigit(state: CalculatorState, digit: string): CalculatorState {
  if (!/^\d$/.test(digit)) return state;
  if (state.error || state.waitingForOperand) {
    return { ...state, display: digit, waitingForOperand: false, error: false };
  }
  if (state.display === '0') return { ...state, display: digit };
  if (state.display.replace('-', '').replace('.', '').length >= 11) return state;
  return { ...state, display: `${state.display}${digit}` };
}

export function inputCalculatorDecimal(state: CalculatorState): CalculatorState {
  if (state.error || state.waitingForOperand) {
    return { ...state, display: '0.', waitingForOperand: false, error: false };
  }
  if (state.display.includes('.')) return state;
  return { ...state, display: `${state.display}.` };
}

export function selectCalculatorOperator(
  state: CalculatorState,
  operator: CalculatorOperator,
): CalculatorState {
  if (state.error) return { ...createCalculatorState(), operator, storedValue: 0, waitingForOperand: true };
  const current = Number(state.display);
  if (state.operator && state.storedValue !== null && !state.waitingForOperand) {
    const result = evaluate(state.storedValue, current, state.operator);
    const display = readable(result);
    if (display === '无法计算') return { ...createCalculatorState(), display, error: true };
    return { display, storedValue: result, operator, waitingForOperand: true, error: false };
  }
  return { ...state, storedValue: current, operator, waitingForOperand: true };
}

export function calculateResult(state: CalculatorState): CalculatorState {
  if (!state.operator || state.storedValue === null || state.error) return state;
  const result = evaluate(state.storedValue, Number(state.display), state.operator);
  const display = readable(result);
  if (display === '无法计算') return { ...createCalculatorState(), display, error: true };
  return { display, storedValue: null, operator: null, waitingForOperand: true, error: false };
}

export function toggleCalculatorSign(state: CalculatorState): CalculatorState {
  if (state.error || state.display === '0') return state;
  return { ...state, display: state.display.startsWith('-') ? state.display.slice(1) : `-${state.display}` };
}
