// Currency formatting utility - Always displays whole numbers by rounding up
export const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  
  // For negative values, round away from zero (more negative)
  // For positive values, round up (more positive)
  // This ensures losses are never understated and wins are never overstated
  const roundedNum = num >= 0 ? Math.ceil(num) : Math.floor(num);
  
  return `$${roundedNum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// Format currency for display in text
export const formatCurrencyText = (amount, suffix = '') => {
  return `${formatCurrency(amount)}${suffix ? ' ' + suffix : ''}`;
};
