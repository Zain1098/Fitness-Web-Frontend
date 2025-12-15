import { useState, useEffect } from 'react'
import './FoodDatabase.css'

const FOOD_CATEGORIES = {
  'Pakistani Dishes': [
    { name: 'Chicken Biryani', localName: 'Murgh Biryani', calories: 200, protein: 12, carbs: 28, fats: 5, image: '🍛', per: '100g' },
    { name: 'Beef Nihari', localName: 'Nihari', calories: 235, protein: 18, carbs: 8, fats: 15, image: '🍲', per: '100g' },
    { name: 'Chicken Karahi', localName: 'Murgh Karahi', calories: 180, protein: 20, carbs: 6, fats: 9, image: '🍗', per: '100g' },
    { name: 'Daal Chawal', localName: 'Daal Chawal', calories: 130, protein: 6, carbs: 22, fats: 2, image: '🍚', per: '100g' },
    { name: 'Haleem', localName: 'Haleem', calories: 150, protein: 10, carbs: 15, fats: 6, image: '🥘', per: '100g' },
    { name: 'Chapli Kabab', localName: 'Chapli Kabab', calories: 280, protein: 22, carbs: 8, fats: 18, image: '🥙', per: '100g' }
  ],
  'Proteins': [
    { name: 'Chicken Breast', localName: 'Murgh', calories: 165, protein: 31, carbs: 0, fats: 3.6, image: '🍗', per: '100g' },
    { name: 'Beef', localName: 'Gosht', calories: 250, protein: 26, carbs: 0, fats: 15, image: '🥩', per: '100g' },
    { name: 'Mutton', localName: 'Bakra Gosht', calories: 294, protein: 25, carbs: 0, fats: 21, image: '🍖', per: '100g' },
    { name: 'Fish', localName: 'Machli', calories: 206, protein: 22, carbs: 0, fats: 12, image: '🐟', per: '100g' },
    { name: 'Eggs', localName: 'Anday', calories: 155, protein: 13, carbs: 1.1, fats: 11, image: '🥚', per: '100g' },
    { name: 'Lentils', localName: 'Daal', calories: 116, protein: 9, carbs: 20, fats: 0.4, image: '🫘', per: '100g' }
  ],
  'Carbohydrates': [
    { name: 'White Rice', localName: 'Chawal', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, image: '🍚', per: '100g' },
    { name: 'Roti', localName: 'Roti/Chapati', calories: 120, protein: 3.5, carbs: 24, fats: 1.2, image: '🫓', per: '1 piece' },
    { name: 'Naan', localName: 'Naan', calories: 262, protein: 9, carbs: 46, fats: 5, image: '🥖', per: '100g' },
    { name: 'Paratha', localName: 'Paratha', calories: 320, protein: 6, carbs: 38, fats: 15, image: '🥞', per: '100g' },
    { name: 'Potato', localName: 'Aloo', calories: 77, protein: 2, carbs: 17, fats: 0.1, image: '🥔', per: '100g' },
    { name: 'Banana', localName: 'Kela', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, image: '🍌', per: '100g' }
  ],
  'Vegetables': [
    { name: 'Tomato', localName: 'Timater', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, image: '🍅', per: '100g' },
    { name: 'Onion', localName: 'Pyaz', calories: 40, protein: 1.1, carbs: 9, fats: 0.1, image: '🧅', per: '100g' },
    { name: 'Spinach', localName: 'Palak', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, image: '🥬', per: '100g' },
    { name: 'Okra', localName: 'Bhindi', calories: 33, protein: 1.9, carbs: 7, fats: 0.2, image: '🫛', per: '100g' },
    { name: 'Eggplant', localName: 'Baigan', calories: 25, protein: 1, carbs: 6, fats: 0.2, image: '🍆', per: '100g' },
    { name: 'Cucumber', localName: 'Kheera', calories: 16, protein: 0.7, carbs: 4, fats: 0.1, image: '🥒', per: '100g' },
    { name: 'Carrot', localName: 'Gajar', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, image: '🥕', per: '100g' },
    { name: 'Peas', localName: 'Matar', calories: 81, protein: 5, carbs: 14, fats: 0.4, image: '🫛', per: '100g' }
  ],
  'Fruits': [
    { name: 'Mango', localName: 'Aam', calories: 60, protein: 0.8, carbs: 15, fats: 0.4, image: '🥭', per: '100g' },
    { name: 'Apple', localName: 'Seb', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, image: '🍎', per: '100g' },
    { name: 'Orange', localName: 'Sangtara', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, image: '🍊', per: '100g' },
    { name: 'Guava', localName: 'Amrood', calories: 68, protein: 2.6, carbs: 14, fats: 1, image: '🍐', per: '100g' },
    { name: 'Watermelon', localName: 'Tarbooz', calories: 30, protein: 0.6, carbs: 8, fats: 0.2, image: '🍉', per: '100g' },
    { name: 'Grapes', localName: 'Angoor', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, image: '🍇', per: '100g' }
  ],
  'Dairy': [
    { name: 'Milk', localName: 'Doodh', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, image: '🥛', per: '100ml' },
    { name: 'Yogurt', localName: 'Dahi', calories: 59, protein: 10, carbs: 3.6, fats: 0.4, image: '🥣', per: '100g' },
    { name: 'Butter', localName: 'Makkhan', calories: 717, protein: 0.9, carbs: 0.1, fats: 81, image: '🧈', per: '100g' },
    { name: 'Cheese', localName: 'Paneer', calories: 265, protein: 18, carbs: 3, fats: 20, image: '🧀', per: '100g' },
    { name: 'Cream', localName: 'Malai', calories: 340, protein: 2.2, carbs: 3, fats: 36, image: '🥛', per: '100g' },
    { name: 'Lassi', localName: 'Lassi', calories: 60, protein: 3, carbs: 8, fats: 1.5, image: '🥤', per: '100ml' }
  ],
  'Nuts & Snacks': [
    { name: 'Almonds', localName: 'Badam', calories: 579, protein: 21, carbs: 22, fats: 50, image: '🥜', per: '100g' },
    { name: 'Cashews', localName: 'Kaju', calories: 553, protein: 18, carbs: 30, fats: 44, image: '🥜', per: '100g' },
    { name: 'Pistachios', localName: 'Pista', calories: 560, protein: 20, carbs: 28, fats: 45, image: '🥜', per: '100g' },
    { name: 'Peanuts', localName: 'Moongphali', calories: 567, protein: 26, carbs: 16, fats: 49, image: '🥜', per: '100g' },
    { name: 'Samosa', localName: 'Samosa', calories: 262, protein: 5, carbs: 28, fats: 15, image: '🥟', per: '100g' },
    { name: 'Pakora', localName: 'Pakora', calories: 280, protein: 6, carbs: 30, fats: 16, image: '🍤', per: '100g' }
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
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.localName?.toLowerCase().includes(searchTerm.toLowerCase())
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
              {food.localName && <p className="food-local-name">{food.localName}</p>}
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