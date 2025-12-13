import { useState, useEffect } from 'react'
import './FoodDatabase.css'

const FOOD_CATEGORIES = {
  'Proteins': [
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, image: '🍗', per: '100g' },
    { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fats: 13, image: '🐟', per: '100g' },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fats: 11, image: '🥚', per: '100g' },
    { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, image: '🥛', per: '100g' },
    { name: 'Tofu', calories: 76, protein: 8, carbs: 1.9, fats: 4.8, image: '🧈', per: '100g' },
    { name: 'Lean Beef', calories: 250, protein: 26, carbs: 0, fats: 15, image: '🥩', per: '100g' }
  ],
  'Carbohydrates': [
    { name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23, fats: 0.9, image: '🍚', per: '100g' },
    { name: 'Oats', calories: 389, protein: 17, carbs: 66, fats: 7, image: '🥣', per: '100g' },
    { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fats: 0.1, image: '🍠', per: '100g' },
    { name: 'Quinoa', calories: 120, protein: 4.4, carbs: 22, fats: 1.9, image: '🌾', per: '100g' },
    { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fats: 4.2, image: '🍞', per: '100g' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, image: '🍌', per: '100g' }
  ],
  'Vegetables': [
    { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fats: 0.4, image: '🥦', per: '100g' },
    { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, image: '🥬', per: '100g' },
    { name: 'Carrots', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, image: '🥕', per: '100g' },
    { name: 'Bell Pepper', calories: 31, protein: 1, carbs: 7, fats: 0.3, image: '🫑', per: '100g' },
    { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, image: '🍅', per: '100g' },
    { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 4, fats: 0.1, image: '🥒', per: '100g' }
  ],
  'Fruits': [
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, image: '🍎', per: '100g' },
    { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, image: '🍊', per: '100g' },
    { name: 'Berries Mix', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, image: '🫐', per: '100g' },
    { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, image: '🥭', per: '100g' },
    { name: 'Grapes', calories: 62, protein: 0.6, carbs: 16, fats: 0.2, image: '🍇', per: '100g' },
    { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, image: '🥑', per: '100g' }
  ],
  'Nuts & Seeds': [
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, image: '🥜', per: '100g' },
    { name: 'Walnuts', calories: 654, protein: 15, carbs: 14, fats: 65, image: '🌰', per: '100g' },
    { name: 'Chia Seeds', calories: 486, protein: 17, carbs: 42, fats: 31, image: '🌱', per: '100g' },
    { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fats: 50, image: '🥜', per: '100g' },
    { name: 'Sunflower Seeds', calories: 584, protein: 21, carbs: 20, fats: 51, image: '🌻', per: '100g' },
    { name: 'Cashews', calories: 553, protein: 18, carbs: 30, fats: 44, image: '🥜', per: '100g' }
  ],
  'Dairy': [
    { name: 'Milk (2%)', calories: 50, protein: 3.4, carbs: 5, fats: 2, image: '🥛', per: '100ml' },
    { name: 'Cheddar Cheese', calories: 403, protein: 25, carbs: 1.3, fats: 33, image: '🧀', per: '100g' },
    { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, image: '🧀', per: '100g' },
    { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fats: 81, image: '🧈', per: '100g' },
    { name: 'Yogurt', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, image: '🥛', per: '100g' },
    { name: 'Mozzarella', calories: 300, protein: 22, carbs: 2.2, fats: 22, image: '🧀', per: '100g' }
  ]
}

export default function FoodDatabase({ onSelectFood, searchTerm = '' }) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filteredFoods, setFilteredFoods] = useState([])

  useEffect(() => {
    let foods = []
    
    if (selectedCategory === 'All') {
      Object.values(FOOD_CATEGORIES).forEach(categoryFoods => {
        foods = [...foods, ...categoryFoods]
      })
    } else {
      foods = FOOD_CATEGORIES[selectedCategory] || []
    }

    if (searchTerm) {
      foods = foods.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFoods(foods)
  }, [selectedCategory, searchTerm])

  const categories = ['All', ...Object.keys(FOOD_CATEGORIES)]

  return (
    <div className="food-database">
      <div className="database-header">
        <h3>🍽️ Food Database</h3>
        <p>Select from our curated list of foods with accurate nutrition data</p>
      </div>

      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="foods-grid">
        {filteredFoods.map((food, index) => (
          <div 
            key={`${food.name}-${index}`}
            className="food-card"
            onClick={() => onSelectFood(food)}
          >
            <div className="food-image">{food.image}</div>
            <div className="food-info">
              <h4>{food.name}</h4>
              <p className="food-serving">Per {food.per}</p>
              <div className="food-macros">
                <span className="macro calories">🔥 {food.calories}</span>
                <span className="macro protein">💪 {food.protein}g</span>
                <span className="macro carbs">🌾 {food.carbs}g</span>
                <span className="macro fats">🥑 {food.fats}g</span>
              </div>
            </div>
            <div className="add-icon">➕</div>
          </div>
        ))}
      </div>

      {filteredFoods.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h4>No foods found</h4>
          <p>Try a different search term or category</p>
        </div>
      )}
    </div>
  )
}