
export const formatCurrencyBRL = (value: number | string): string => {
  const amount = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
  if (isNaN(amount)) return '0,00';
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrencyBRL = (formattedValue: string): number => {
  const cleanValue = formattedValue.replace(/\D/g, '');
  return parseFloat(cleanValue) / 100;
};

export const handleCurrencyInputChange = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (!cleanValue) return '';
  return formatCurrencyBRL(cleanValue);
};
