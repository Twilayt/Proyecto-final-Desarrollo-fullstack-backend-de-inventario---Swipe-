const { validateProduct, validateClient } = require('../src/utils/validators');

describe('validators', () => {
  test('validateProduct: missing fields', () => {
    expect(validateProduct({})).toBe('Falta sku');
    expect(validateProduct({ sku: 'A' })).toBe('Falta nombre');
    expect(validateProduct({ sku: 'A', nombre: 'X' })).toBe('Falta categoria');
  });

  test('validateProduct: negative stock/price', () => {
    expect(validateProduct({ sku:'A', nombre:'X', categoria:'C', stock:-1 })).toBe('Stock no puede ser negativo');
    expect(validateProduct({ sku:'A', nombre:'X', categoria:'C', precio:-5 })).toBe('Precio no puede ser negativo');
  });

  test('validateProduct: date format', () => {
    expect(validateProduct({ sku:'A', nombre:'X', categoria:'C', fecha_caducidad:'2026/01/01' }))
      .toBe('fecha_caducidad debe ser YYYY-MM-DD');
  });

  test('validateProduct: ok', () => {
    expect(validateProduct({ sku:'A', nombre:'X', categoria:'C', stock:0, precio:0, fecha_caducidad:'2026-01-01' }))
      .toBe(null);
  });

  test('validateClient: ok', () => {
    expect(validateClient({ nombre:'Cliente' })).toBe(null);
  });

  test('validateClient: invalid email', () => {
    expect(validateClient({ nombre:'Cliente', email:'mal' })).toBe('Email inválido');
  });
});
