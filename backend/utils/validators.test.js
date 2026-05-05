const {
  validateEmail,
  validatePassword,
  validateProjectName,
  validateTaskTitle,
  validateMongoId
} = require('./validators');

describe('validateEmail', () => {
  test('accepts a normal email', () => {
    expect(validateEmail('jane@example.com')).toBe(true);
  });

  test('rejects an email without an @', () => {
    expect(validateEmail('janeexample.com')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePassword', () => {
  test('accepts a 6-character password', () => {
    expect(validatePassword('abcdef')).toEqual({ valid: true });
  });

  test('rejects a short password with a helpful message', () => {
    const result = validatePassword('123');
    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/at least 6/i);
  });

  test('rejects an empty password', () => {
    expect(validatePassword('').valid).toBe(false);
  });
});

describe('validateProjectName', () => {
  test('accepts a normal name', () => {
    expect(validateProjectName('Marketing site')).toEqual({ valid: true });
  });

  test('rejects whitespace-only names', () => {
    expect(validateProjectName('   ').valid).toBe(false);
  });

  test('rejects names over 100 characters', () => {
    expect(validateProjectName('x'.repeat(101)).valid).toBe(false);
  });
});

describe('validateTaskTitle', () => {
  test('accepts a normal title', () => {
    expect(validateTaskTitle('Ship the feature')).toEqual({ valid: true });
  });

  test('rejects empty titles', () => {
    expect(validateTaskTitle('').valid).toBe(false);
  });

  test('rejects titles over 200 characters', () => {
    expect(validateTaskTitle('a'.repeat(201)).valid).toBe(false);
  });
});

describe('validateMongoId', () => {
  test('accepts a valid 24-char hex ObjectId', () => {
    expect(validateMongoId('507f1f77bcf86cd799439011')).toBe(true);
  });

  test('rejects a too-short id', () => {
    expect(validateMongoId('507f1f77')).toBe(false);
  });

  test('rejects non-hex characters', () => {
    expect(validateMongoId('zzzf1f77bcf86cd799439011')).toBe(false);
  });
});
