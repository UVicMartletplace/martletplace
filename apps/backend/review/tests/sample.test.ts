import { describe, it, expect } from 'vitest'

const add = (a: number, b: number): number => a + b

describe('Sample Test Suite', () => {
  it('should pass this sample test', () => {
    expect(true).toBe(true)
  })

  it('should add two numbers correctly', () => {
    const result = add(2, 3)
    expect(result).toBe(5)
  })

})
