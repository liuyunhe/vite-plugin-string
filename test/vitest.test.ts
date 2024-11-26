import { describe, it, expect, test } from 'vitest'
import { defaultCompress } from '../src/index'

describe('defaultCompress', () => {
  it('should remove comments', () => {
    const input = `// This is a comment
    const a = 1; /* This is another comment */
    `
    const output = defaultCompress(input)
    expect(output).toEqual('const a=1;')
  })

  it('should remove extra spaces and newlines', () => {
    const input = `const a =  1  ;  
    console.log(a);
    `
    const output = defaultCompress(input)
    expect(output).toEqual('const a=1;console.log(a);')
  })

  it('should preserve #preprocessor-directives', () => {
    const input = `#define SHADER_VERSION 100
    const a = 1;
    `
    const output = defaultCompress(input)
    expect(output).toEqual('#define SHADER_VERSION 100\nconst a=1;')
  })

  it('should remove spaces around operators', () => {
    const input = `const a = 1 + 2 * 3;`
    const output = defaultCompress(input)
    expect(output).toEqual('const a=1+2*3;')
  })

  // Add more test cases as needed
})
