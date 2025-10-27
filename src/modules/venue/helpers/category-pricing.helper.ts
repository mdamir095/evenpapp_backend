export class CategoryPricingHelper {
  
  /**
   * Generate category-specific pricing array for venues
   * @param categoryName - The name of the category
   * @returns Array of pricing objects specific to the category
   */
  static generateCategoryPricing(categoryName: string): Array<{ title: string; price: number }> {
    const normalizedCategoryName = categoryName.toLowerCase().trim();
    
    // Catering related categories
    if (normalizedCategoryName.includes('catering') || normalizedCategoryName.includes('food')) {
      return [
        { title: 'Veg Price Per Plate', price: 100 },
        { title: 'Non-Veg Price Per Plate', price: 300 },
        { title: 'Decor Setup', price: 400 }
      ];
    }
    
    // Photography related categories
    if (normalizedCategoryName.includes('photographer') || normalizedCategoryName.includes('photography') || normalizedCategoryName.includes('photo')) {
      return [
        { title: 'Drone Coverage', price: 2000 },
        { title: 'Pre Wedding Shoot', price: 5000 },
        { title: 'Portrait Shoot', price: 400 }
      ];
    }
    
    // Venue related categories
    if (normalizedCategoryName.includes('venue') || normalizedCategoryName.includes('hall') || normalizedCategoryName.includes('banquet') || normalizedCategoryName.includes('wedding')) {
      return [
        { title: 'Venue Rental', price: 50000 },
        { title: 'Decor Setup', price: 15000 },
        { title: 'Sound System', price: 5000 }
      ];
    }
    
    // Makeup/Beauty related categories
    if (normalizedCategoryName.includes('makeup') || normalizedCategoryName.includes('beauty') || normalizedCategoryName.includes('bridal')) {
      return [
        { title: 'Bridal Makeup', price: 8000 },
        { title: 'Pre Wedding Makeup', price: 3000 },
        { title: 'Family Makeup', price: 1500 }
      ];
    }
    
    // Music/DJ related categories
    if (normalizedCategoryName.includes('music') || normalizedCategoryName.includes('dj') || normalizedCategoryName.includes('sound')) {
      return [
        { title: 'DJ Service', price: 15000 },
        { title: 'Sound System', price: 8000 },
        { title: 'Live Music', price: 25000 }
      ];
    }
    
    // Decor related categories
    if (normalizedCategoryName.includes('decor') || normalizedCategoryName.includes('decoration') || normalizedCategoryName.includes('floral')) {
      return [
        { title: 'Stage Decor', price: 20000 },
        { title: 'Floral Arrangement', price: 12000 },
        { title: 'Lighting Setup', price: 8000 }
      ];
    }
    
    // Default pricing for unknown categories
    return [
      { title: 'Basic Service', price: 5000 },
      { title: 'Premium Service', price: 15000 },
      { title: 'Custom Service', price: 25000 }
    ];
  }
  
  /**
   * Get category-specific pricing with custom base prices
   * @param categoryName - The name of the category
   * @param baseMultiplier - Multiplier for base prices (default: 1)
   * @returns Array of pricing objects with adjusted prices
   */
  static generateCategoryPricingWithMultiplier(categoryName: string, baseMultiplier: number = 1): Array<{ title: string; price: number }> {
    const basePricing = this.generateCategoryPricing(categoryName);
    
    return basePricing.map(pricingObj => ({
      title: pricingObj.title,
      price: Math.round(pricingObj.price * baseMultiplier)
    }));
  }
}
