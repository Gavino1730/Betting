// Currency formatting utility
export const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  const hasDecimals = num % 1 !== 0;
  
  return hasDecimals 
    ? `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Format currency for display in text
export const formatCurrencyText = (amount, suffix = '') => {
  return `${formatCurrency(amount)}${suffix ? ' ' + suffix : ''}`;
};
