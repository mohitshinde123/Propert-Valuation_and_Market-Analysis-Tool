// Utility functions for formatting

export function formatPrice(price) {
  if (!price || isNaN(price)) return '₹0';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
}

export function formatArea(area) {
  if (!area || isNaN(area)) return '0 sq.ft';
  return `${area.toLocaleString('en-IN')} sq.ft`;
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
}

export function formatRelativeDate(dateString) {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Recently';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return 'Recently';
  }
}

// EMI Calculator - Financial Tool
export function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / (12 * 100);
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
}

export function getAffordability(maxBudget, downPaymentPercent = 20, interestRate = 8.5, tenureYears = 20) {
  const loanAmount = maxBudget * (1 - downPaymentPercent / 100);
  const tenureMonths = tenureYears * 12;
  const emi = calculateEMI(loanAmount, interestRate, tenureMonths);
  return emi;
}

export function getPropertyTypeIcon(type) {
  switch (type) {
    case 'Apartment': return '🏢';
    case 'Villa': return '🏡';
    case 'Plot': return '🏞️';
    case 'Independent House': return '🏠';
    case 'Commercial': return '🏬';
    default: return '🏢';
  }
}

export function getStatusColor(status) {
  switch (status) {
    case 'Ready to Move': return 'bg-green-100 text-green-800';
    case 'Under Construction': return 'bg-yellow-100 text-yellow-800';
    case 'New Launch': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getFacingDirection(facing) {
  const directions = {
    'North': '↑',
    'South': '↓',
    'East': '→',
    'West': '←',
    'North-East': '↗',
    'North-West': '↖',
    'South-East': '↘',
    'South-West': '↙'
  };
  return directions[facing] || '•';
}
