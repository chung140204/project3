class TaxService {
  /**
   * Calculate tax amount for a given price, quantity, and tax rate
   * @param {number} price - Price per unit excluding VAT
   * @param {number} quantity - Quantity of items
   * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
   * @returns {number} Tax amount
   */
  static calculateTax(price, quantity, taxRate) {
    if (price < 0 || quantity < 0 || taxRate < 0) {
      throw new Error('Price, quantity, and tax rate must be non-negative');
    }
    
    const subtotal = price * quantity;
    const taxAmount = subtotal * taxRate;
    
    return Math.round(taxAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate total price including tax
   * @param {number} price - Price per unit excluding VAT
   * @param {number} quantity - Quantity of items
   * @param {number} taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
   * @returns {number} Total amount including VAT
   */
  static calculateTotal(price, quantity, taxRate) {
    if (price < 0 || quantity < 0 || taxRate < 0) {
      throw new Error('Price, quantity, and tax rate must be non-negative');
    }
    
    const subtotal = price * quantity;
    const taxAmount = this.calculateTax(price, quantity, taxRate);
    const total = subtotal + taxAmount;
    
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }
}

module.exports = TaxService;




