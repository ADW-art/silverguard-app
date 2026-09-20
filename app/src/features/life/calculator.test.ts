import { describe, expect, it } from 'vitest';
import {
  calculateResult,
  createCalculatorState,
  inputCalculatorDecimal,
  inputCalculatorDigit,
  selectCalculatorOperator,
  toggleCalculatorSign,
} from './calculator';

function enter(value: string) {
  return [...value].reduce((state, token) => token === '.'
    ? inputCalculatorDecimal(state)
    : inputCalculatorDigit(state, token), createCalculatorState());
}

describe('large-text calculator', () => {
  it('calculates the four basic operators', () => {
    const cases = [
      ['+', '8'], ['-', '2'], ['×', '15'], ['÷', '1.6666666667'],
    ] as const;
    for (const [operator, expected] of cases) {
      const left = enter('5');
      const selected = selectCalculatorOperator(left, operator);
      const right = inputCalculatorDigit(selected, '3');
      expect(calculateResult(right).display).toBe(expected);
    }
  });

  it('supports decimals without adding a second point', () => {
    const once = inputCalculatorDecimal(enter('12'));
    expect(inputCalculatorDecimal(once).display).toBe('12.');
    expect(inputCalculatorDigit(once, '5').display).toBe('12.5');
  });

  it('reports division by zero without crashing', () => {
    const selected = selectCalculatorOperator(enter('9'), '÷');
    const result = calculateResult(inputCalculatorDigit(selected, '0'));
    expect(result).toMatchObject({ display: '无法计算', error: true });
  });

  it('chains an intermediate result when an operator changes', () => {
    const plus = selectCalculatorOperator(enter('2'), '+');
    const three = inputCalculatorDigit(plus, '3');
    const times = selectCalculatorOperator(three, '×');
    expect(times.display).toBe('5');
    expect(calculateResult(inputCalculatorDigit(times, '4')).display).toBe('20');
  });

  it('toggles positive and negative values', () => {
    expect(toggleCalculatorSign(enter('7')).display).toBe('-7');
    expect(toggleCalculatorSign(toggleCalculatorSign(enter('7'))).display).toBe('7');
  });
});
