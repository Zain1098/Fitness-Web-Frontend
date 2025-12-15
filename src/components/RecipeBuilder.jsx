import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
import { API_ENDPOINTS } from '../config/api.js'
import './RecipeBuilder.css'

export default function RecipeBuilder() {
  const { token } = useAuth()
  const [recipe, setRecipe] = useState({
    name: '',
    servings: 1,
    ingredients: [],
    instructions: '',
    category: 'main_course'
  })
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  })
  const [saving, setSaving] = useState(false)
  const [savedRecipes, setSavedRecipes] = useState([])
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  const [ingredientSuggestions, setIngredientSuggestions] = useState([])
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false)

  const INGREDIENT_DATABASE = [
    { name: 'Chicken Breast', local: 'Murgh Seena', cal: 165, prot: 31, carb: 0, fat: 3.6 },
    { name: 'Chicken Thigh', local: 'Murgh Taang', cal: 209, prot: 26, carb: 0, fat: 11 },
    { name: 'Beef', local: 'Gosht', cal: 250, prot: 26, carb: 0, fat: 15 },
    { name: 'Mutton', local: 'Bakra', cal: 294, prot: 25, carb: 0, fat: 21 },
    { name: 'Fish', local: 'Machli', cal: 206, prot: 22, carb: 0, fat: 12 },
    { name: 'Prawns', local: 'Jhinga', cal: 99, prot: 24, carb: 0.2, fat: 0.3 },
    { name: 'Eggs', local: 'Anday', cal: 155, prot: 13, carb: 1.1, fat: 11 },
    { name: 'Egg White', local: 'Safedi', cal: 52, prot: 11, carb: 0.7, fat: 0.2 },
    { name: 'Lentils', local: 'Daal', cal: 116, prot: 9, carb: 20, fat: 0.4 },
    { name: 'Chickpeas', local: 'Chanay', cal: 164, prot: 9, carb: 27, fat: 2.6 },
    { name: 'Black Chickpeas', local: 'Kala Chana', cal: 160, prot: 8, carb: 27, fat: 2.5 },
    { name: 'Kidney Beans', local: 'Rajma', cal: 127, prot: 8.7, carb: 23, fat: 0.5 },
    { name: 'Mung Beans', local: 'Moong', cal: 105, prot: 7, carb: 19, fat: 0.4 },
    { name: 'White Rice', local: 'Safaid Chawal', cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
    { name: 'Brown Rice', local: 'Bhura Chawal', cal: 111, prot: 2.6, carb: 23, fat: 0.9 },
    { name: 'Basmati Rice', local: 'Basmati', cal: 121, prot: 3, carb: 25, fat: 0.4 },
    { name: 'Roti', local: 'Roti', cal: 120, prot: 3.5, carb: 24, fat: 1.2 },
    { name: 'Naan', local: 'Naan', cal: 262, prot: 9, carb: 46, fat: 5 },
    { name: 'Paratha', local: 'Paratha', cal: 320, prot: 6, carb: 38, fat: 15 },
    { name: 'Chapati', local: 'Chapati', cal: 104, prot: 3.1, carb: 18, fat: 2.5 },
    { name: 'Potato', local: 'Aloo', cal: 77, prot: 2, carb: 17, fat: 0.1 },
    { name: 'Sweet Potato', local: 'Shakarkandi', cal: 86, prot: 1.6, carb: 20, fat: 0.1 },
    { name: 'Tomato', local: 'Timater', cal: 18, prot: 0.9, carb: 3.9, fat: 0.2 },
    { name: 'Onion', local: 'Pyaz', cal: 40, prot: 1.1, carb: 9, fat: 0.1 },
    { name: 'Spinach', local: 'Palak', cal: 23, prot: 2.9, carb: 3.6, fat: 0.4 },
    { name: 'Okra', local: 'Bhindi', cal: 33, prot: 1.9, carb: 7, fat: 0.2 },
    { name: 'Eggplant', local: 'Baigan', cal: 25, prot: 1, carb: 6, fat: 0.2 },
    { name: 'Cucumber', local: 'Kheera', cal: 16, prot: 0.7, carb: 4, fat: 0.1 },
    { name: 'Carrot', local: 'Gajar', cal: 41, prot: 0.9, carb: 10, fat: 0.2 },
    { name: 'Peas', local: 'Matar', cal: 81, prot: 5, carb: 14, fat: 0.4 },
    { name: 'Cauliflower', local: 'Phool Gobi', cal: 25, prot: 1.9, carb: 5, fat: 0.3 },
    { name: 'Cabbage', local: 'Band Gobi', cal: 25, prot: 1.3, carb: 6, fat: 0.1 },
    { name: 'Bottle Gourd', local: 'Lauki', cal: 14, prot: 0.6, carb: 3.4, fat: 0.02 },
    { name: 'Bitter Gourd', local: 'Karela', cal: 17, prot: 1, carb: 3.7, fat: 0.2 },
    { name: 'Pumpkin', local: 'Kaddu', cal: 26, prot: 1, carb: 6.5, fat: 0.1 },
    { name: 'Bell Pepper', local: 'Shimla Mirch', cal: 31, prot: 1, carb: 6, fat: 0.3 },
    { name: 'Green Beans', local: 'Lobia', cal: 31, prot: 1.8, carb: 7, fat: 0.2 },
    { name: 'Radish', local: 'Mooli', cal: 16, prot: 0.7, carb: 3.4, fat: 0.1 },
    { name: 'Turnip', local: 'Shalgam', cal: 28, prot: 0.9, carb: 6.4, fat: 0.1 },
    { name: 'Ginger', local: 'Adrak', cal: 80, prot: 1.8, carb: 18, fat: 0.8 },
    { name: 'Garlic', local: 'Lehsan', cal: 149, prot: 6.4, carb: 33, fat: 0.5 },
    { name: 'Green Chili', local: 'Hari Mirch', cal: 40, prot: 2, carb: 9, fat: 0.2 },
    { name: 'Coriander', local: 'Dhania', cal: 23, prot: 2.1, carb: 3.7, fat: 0.5 },
    { name: 'Mint', local: 'Pudina', cal: 44, prot: 3.3, carb: 8, fat: 0.7 },
    { name: 'Mango', local: 'Aam', cal: 60, prot: 0.8, carb: 15, fat: 0.4 },
    { name: 'Apple', local: 'Seb', cal: 52, prot: 0.3, carb: 14, fat: 0.2 },
    { name: 'Banana', local: 'Kela', cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
    { name: 'Orange', local: 'Sangtara', cal: 47, prot: 0.9, carb: 12, fat: 0.1 },
    { name: 'Guava', local: 'Amrood', cal: 68, prot: 2.6, carb: 14, fat: 1 },
    { name: 'Watermelon', local: 'Tarbooz', cal: 30, prot: 0.6, carb: 8, fat: 0.2 },
    { name: 'Papaya', local: 'Papita', cal: 43, prot: 0.5, carb: 11, fat: 0.3 },
    { name: 'Grapes', local: 'Angoor', cal: 69, prot: 0.7, carb: 18, fat: 0.2 },
    { name: 'Pomegranate', local: 'Anar', cal: 83, prot: 1.7, carb: 19, fat: 1.2 },
    { name: 'Dates', local: 'Khajoor', cal: 277, prot: 1.8, carb: 75, fat: 0.2 },
    { name: 'Whole Milk', local: 'Doodh', cal: 61, prot: 3.2, carb: 4.8, fat: 3.3 },
    { name: 'Yogurt', local: 'Dahi', cal: 59, prot: 10, carb: 3.6, fat: 0.4 },
    { name: 'Butter', local: 'Makkhan', cal: 717, prot: 0.9, carb: 0.1, fat: 81 },
    { name: 'Cheese', local: 'Paneer', cal: 265, prot: 18, carb: 3, fat: 20 },
    { name: 'Cream', local: 'Malai', cal: 340, prot: 2.2, carb: 2.8, fat: 36 },
    { name: 'Ghee', local: 'Ghee', cal: 900, prot: 0, carb: 0, fat: 100 },
    { name: 'Almonds', local: 'Badam', cal: 579, prot: 21, carb: 22, fat: 50 },
    { name: 'Cashews', local: 'Kaju', cal: 553, prot: 18, carb: 30, fat: 44 },
    { name: 'Walnuts', local: 'Akhrot', cal: 654, prot: 15, carb: 14, fat: 65 },
    { name: 'Pistachios', local: 'Pista', cal: 560, prot: 20, carb: 28, fat: 45 },
    { name: 'Peanuts', local: 'Mungphali', cal: 567, prot: 26, carb: 16, fat: 49 },
    { name: 'Cooking Oil', local: 'Tel', cal: 884, prot: 0, carb: 0, fat: 100 },
    { name: 'Cumin', local: 'Zeera', cal: 375, prot: 18, carb: 44, fat: 22 },
    { name: 'Turmeric', local: 'Haldi', cal: 312, prot: 10, carb: 67, fat: 3 },
    { name: 'Red Chili', local: 'Lal Mirch', cal: 282, prot: 12, carb: 50, fat: 17 },
    { name: 'Salt', local: 'Namak', cal: 0, prot: 0, carb: 0, fat: 0 }
  ]

  const units = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice']
  const categories = [
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snack', label: '🍎 Snack' },
    { value: 'dessert', label: '🍰 Dessert' },
    { value: 'drink', label: '🥤 Drink' }
  ]

  const handleIngredientInput = (value) => {
    setNewIngredient(prev => ({ ...prev, name: value }))
    if (value.length > 1) {
      const matches = INGREDIENT_DATABASE.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.local.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setIngredientSuggestions(matches)
      setShowIngredientSuggestions(matches.length > 0)
    } else {
      setShowIngredientSuggestions(false)
    }
  }

  const selectIngredientSuggestion = (item) => {
    const qty = Number(newIngredient.quantity) || 100
    const multiplier = qty / 100
    setNewIngredient(prev => ({
      ...prev,
      name: item.name,
      quantity: qty.toString(),
      calories: Math.round(item.cal * multiplier).toString(),
      protein: Math.round(item.prot * multiplier * 10) / 10,
      carbs: Math.round(item.carb * multiplier * 10) / 10,
      fats: Math.round(item.fat * multiplier * 10) / 10
    }))
    setShowIngredientSuggestions(false)
  }

  const convertToGrams = (qty, unit) => {
    const conversions = {
      'g': 1,
      'kg': 1000,
      'ml': 1,
      'l': 1000,
      'cup': 240,
      'tbsp': 15,
      'tsp': 5,
      'piece': 100,
      'slice': 30
    }
    return qty * (conversions[unit] || 1)
  }

  const handleQuantityChange = (value) => {
    setNewIngredient(prev => {
      const qty = Number(value) || 0
      if (prev.calories && qty > 0) {
        const gramsQty = convertToGrams(qty, prev.unit)
        const multiplier = gramsQty / 100
        
        const item = INGREDIENT_DATABASE.find(i => i.name === prev.name)
        if (item) {
          return {
            ...prev,
            quantity: value,
            calories: Math.round(item.cal * multiplier).toString(),
            protein: (Math.round(item.prot * multiplier * 10) / 10).toString(),
            carbs: (Math.round(item.carb * multiplier * 10) / 10).toString(),
            fats: (Math.round(item.fat * multiplier * 10) / 10).toString()
          }
        }
      }
      return { ...prev, quantity: value }
    })
  }

  const handleUnitChange = (value) => {
    setNewIngredient(prev => {
      const qty = Number(prev.quantity) || 0
      if (prev.calories && qty > 0) {
        const gramsQty = convertToGrams(qty, value)
        const multiplier = gramsQty / 100
        
        const item = INGREDIENT_DATABASE.find(i => i.name === prev.name)
        if (item) {
          return {
            ...prev,
            unit: value,
            calories: Math.round(item.cal * multiplier).toString(),
            protein: (Math.round(item.prot * multiplier * 10) / 10).toString(),
            carbs: (Math.round(item.carb * multiplier * 10) / 10).toString(),
            fats: (Math.round(item.fat * multiplier * 10) / 10).toString()
          }
        }
      }
      return { ...prev, unit: value }
    })
  }

  const loadSavedRecipes = async () => {
    try {
      setLoadingRecipes(true)
      const data = await api(API_ENDPOINTS.recipes, { token })
      setSavedRecipes(data || [])
    } catch (err) {
      console.error('Failed to load recipes:', err)
    } finally {
      setLoadingRecipes(false)
    }
  }

  useEffect(() => {
    loadSavedRecipes()
  }, [token])

  const addIngredient = () => {
    if (!newIngredient.name.trim()) return

    const ingredient = {
      ...newIngredient,
      id: Date.now(),
      quantity: Number(newIngredient.quantity) || 0,
      calories: Number(newIngredient.calories) || 0,
      protein: Number(newIngredient.protein) || 0,
      carbs: Number(newIngredient.carbs) || 0,
      fats: Number(newIngredient.fats) || 0
    }

    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }))

    setNewIngredient({
      name: '',
      quantity: '',
      unit: 'g',
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    })
  }

  const removeIngredient = (id) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }))
  }

  const calculateTotalNutrition = () => {
    return recipe.ingredients.reduce((total, ingredient) => {
      const multiplier = ingredient.quantity / 100 // assuming nutrition is per 100g
      return {
        calories: total.calories + (ingredient.calories * multiplier),
        protein: total.protein + (ingredient.protein * multiplier),
        carbs: total.carbs + (ingredient.carbs * multiplier),
        fats: total.fats + (ingredient.fats * multiplier)
      }
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 })
  }

  const getNutritionPerServing = () => {
    const total = calculateTotalNutrition()
    const servings = recipe.servings || 1
    return {
      calories: Math.round(total.calories / servings),
      protein: Math.round(total.protein / servings * 10) / 10,
      carbs: Math.round(total.carbs / servings * 10) / 10,
      fats: Math.round(total.fats / servings * 10) / 10
    }
  }

  const saveRecipe = async () => {
    if (!recipe.name.trim() || recipe.ingredients.length === 0) {
      alert('Please add recipe name and at least one ingredient')
      return
    }

    try {
      setSaving(true)
      const recipeData = {
        ...recipe,
        nutrition: getNutritionPerServing(),
        totalNutrition: calculateTotalNutrition()
      }

      await api(API_ENDPOINTS.recipes, {
        method: 'POST',
        body: recipeData,
        token
      })

      setRecipe({
        name: '',
        servings: 1,
        ingredients: [],
        instructions: '',
        category: 'main_course'
      })

      alert('Recipe saved successfully!')
      loadSavedRecipes()
    } catch (err) {
      console.error('Failed to save recipe:', err)
      alert('Failed to save recipe')
    } finally {
      setSaving(false)
    }
  }

  const addRecipeToMeal = async (mealType) => {
    if (recipe.ingredients.length === 0) {
      alert('Please add ingredients first')
      return
    }

    try {
      const nutrition = getNutritionPerServing()
      await api(API_ENDPOINTS.nutrition, {
        method: 'POST',
        body: {
          mealType,
          items: [{
            name: recipe.name || 'Custom Recipe',
            quantity: 1,
            ...nutrition
          }]
        },
        token
      })

      alert(`Recipe added to ${mealType}!`)
    } catch (err) {
      console.error('Failed to add recipe to meal:', err)
      alert('Failed to add recipe to meal')
    }
  }

  const fetchIngredientNutrition = async () => {
    if (!newIngredient.name.trim()) return
    
    try {
      const searchQuery = `100g ${newIngredient.name.trim()}`
      const data = await api(`/nutrition-lookup?ingr=${encodeURIComponent(searchQuery)}`, { token })
      
      if (data.calories) {
        const nutrients = data.totalNutrients || {}
        setNewIngredient(prev => ({
          ...prev,
          calories: Math.round(data.calories).toString(),
          protein: Math.round(nutrients.PROCNT?.quantity || 0).toString(),
          carbs: Math.round(nutrients.CHOCDF?.quantity || 0).toString(),
          fats: Math.round(nutrients.FAT?.quantity || 0).toString()
        }))
      }
    } catch (err) {
      console.error('Failed to fetch nutrition:', err)
    }
  }

  const totalNutrition = calculateTotalNutrition()
  const perServingNutrition = getNutritionPerServing()

  const deleteRecipe = async (id) => {
    if (!confirm('Delete this recipe?')) return
    try {
      await api(`${API_ENDPOINTS.recipes}/${id}`, { method: 'DELETE', token })
      loadSavedRecipes()
      alert('Recipe deleted!')
    } catch (err) {
      console.error('Failed to delete recipe:', err)
      alert('Failed to delete recipe')
    }
  }

  const loadRecipe = (savedRecipe) => {
    setRecipe({
      name: savedRecipe.name,
      servings: savedRecipe.servings,
      ingredients: savedRecipe.ingredients.map(ing => ({ ...ing, id: Date.now() + Math.random() })),
      instructions: savedRecipe.instructions || '',
      category: savedRecipe.category
    })
  }

  return (
    <div className="recipe-builder">
      <div className="builder-header">
        <div className="header-content">
          <h3>👨‍🍳 Recipe Builder</h3>
          <p>Create recipes with Pakistani ingredients • Roman Urdu search</p>
        </div>
        {recipe.ingredients.length > 0 && (
          <div className="quick-stats">
            <span className="stat">🔥 {Math.round(totalNutrition.calories)}</span>
            <span className="stat">💪 {Math.round(totalNutrition.protein)}g</span>
            <span className="stat">📦 {recipe.ingredients.length} items</span>
          </div>
        )}
      </div>

      <div className="recipe-form">
        <div className="recipe-basic-info">
          <div className="form-group">
            <label>Recipe Name</label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Chicken Stir Fry"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Servings</label>
            <input
              type="number"
              value={recipe.servings}
              onChange={(e) => setRecipe(prev => ({ ...prev, servings: Number(e.target.value) || 1 }))}
              min="1"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={recipe.category}
              onChange={(e) => setRecipe(prev => ({ ...prev, category: e.target.value }))}
              className="form-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="ingredients-section">
          <div className="section-header-row">
            <h4>🥘 Ingredients</h4>
            {recipe.ingredients.length > 0 && <span className="count-badge">{recipe.ingredients.length}</span>}
          </div>

          <div className="ingredient-form" style={{position: 'relative'}}>
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => handleIngredientInput(e.target.value)}
              onFocus={() => newIngredient.name.length > 1 && setShowIngredientSuggestions(true)}
              placeholder="e.g., Timater, Aloo, Murgh, Daal"
              className="form-input ingredient-name-input"
            />
            {showIngredientSuggestions && ingredientSuggestions.length > 0 && (
              <div className="ingredient-suggestions">
                {ingredientSuggestions.map((item, idx) => (
                  <div 
                    key={idx}
                    className="suggestion-item"
                    onClick={() => selectIngredientSuggestion(item)}
                  >
                    <span className="suggestion-name">{item.name}</span>
                    <span className="suggestion-local">{item.local}</span>
                    <span className="suggestion-cal">{item.cal} cal</span>
                  </div>
                ))}
              </div>
            )}
            <div className="ingredient-row">
              <input
                type="number"
                value={newIngredient.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="Quantity"
                className="form-input"
              />
              <select
                value={newIngredient.unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                className="form-select"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <button onClick={fetchIngredientNutrition} className="fetch-btn" title="Auto-fill nutrition">
                🔍
              </button>
            </div>
            <div className="ingredient-row">
              <input
                type="number"
                value={newIngredient.calories}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, calories: e.target.value }))}
                placeholder="Calories"
                className="form-input"
                readOnly
                style={{background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed'}}
              />
              <input
                type="number"
                value={newIngredient.protein}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, protein: e.target.value }))}
                placeholder="Protein (g)"
                className="form-input"
                readOnly
                style={{background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed'}}
              />
              <input
                type="number"
                value={newIngredient.carbs}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, carbs: e.target.value }))}
                placeholder="Carbs (g)"
                className="form-input"
                readOnly
                style={{background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed'}}
              />
              <input
                type="number"
                value={newIngredient.fats}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, fats: e.target.value }))}
                placeholder="Fats (g)"
                className="form-input"
                readOnly
                style={{background: 'rgba(255, 255, 255, 0.05)', cursor: 'not-allowed'}}
              />
            </div>
            <button onClick={addIngredient} className="add-ingredient-btn">
              ➕ Add Ingredient
            </button>
          </div>

          {recipe.ingredients.length > 0 && (
            <div className="ingredients-list">
              {recipe.ingredients.map(ingredient => (
                <div key={ingredient.id} className="ingredient-item">
                  <div className="ingredient-main">
                    <span className="ingredient-name">{ingredient.name}</span>
                    <span className="ingredient-amount">{ingredient.quantity}{ingredient.unit}</span>
                  </div>
                  <div className="ingredient-nutrition">
                    <span>🔥 {Math.round(ingredient.calories * ingredient.quantity / 100)}</span>
                    <span>💪 {Math.round(ingredient.protein * ingredient.quantity / 100 * 10) / 10}g</span>
                    <span>🌾 {Math.round(ingredient.carbs * ingredient.quantity / 100 * 10) / 10}g</span>
                    <span>🥑 {Math.round(ingredient.fats * ingredient.quantity / 100 * 10) / 10}g</span>
                  </div>
                  <button
                    onClick={() => removeIngredient(ingredient.id)}
                    className="remove-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="instructions-section">
          <h4>📝 Instructions</h4>
          <textarea
            value={recipe.instructions}
            onChange={(e) => setRecipe(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Enter cooking instructions..."
            className="instructions-textarea"
            rows="4"
          />
        </div>

        <div className="nutrition-summary">
          <h4>📊 Nutrition Summary</h4>
          <div className="nutrition-cards">
            <div className="nutrition-card total">
              <h5>Total Recipe</h5>
              <div className="nutrition-values">
                <span>🔥 {Math.round(totalNutrition.calories)} cal</span>
                <span>💪 {Math.round(totalNutrition.protein * 10) / 10}g protein</span>
                <span>🌾 {Math.round(totalNutrition.carbs * 10) / 10}g carbs</span>
                <span>🥑 {Math.round(totalNutrition.fats * 10) / 10}g fats</span>
              </div>
            </div>
            <div className="nutrition-card per-serving">
              <h5>Per Serving ({recipe.servings} servings)</h5>
              <div className="nutrition-values">
                <span>🔥 {perServingNutrition.calories} cal</span>
                <span>💪 {perServingNutrition.protein}g protein</span>
                <span>🌾 {perServingNutrition.carbs}g carbs</span>
                <span>🥑 {perServingNutrition.fats}g fats</span>
              </div>
            </div>
          </div>
        </div>

        <div className="recipe-actions">
          <button
            onClick={saveRecipe}
            disabled={saving || !recipe.name.trim() || recipe.ingredients.length === 0}
            className="save-recipe-btn"
          >
            {saving ? '⏳ Saving...' : '💾 Save Recipe'}
          </button>
          
          <div className="meal-actions">
            <span>Add to meal:</span>
            <button onClick={() => addRecipeToMeal('breakfast')} className="meal-btn breakfast">
              🌅 Breakfast
            </button>
            <button onClick={() => addRecipeToMeal('lunch')} className="meal-btn lunch">
              ☀️ Lunch
            </button>
            <button onClick={() => addRecipeToMeal('dinner')} className="meal-btn dinner">
              🌙 Dinner
            </button>
          </div>
        </div>

        {savedRecipes.length > 0 && (
          <div className="saved-recipes-section">
            <h4>📚 Saved Recipes ({savedRecipes.length})</h4>
            {loadingRecipes ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="saved-recipes-grid">
                {savedRecipes.map(recipe => (
                  <div key={recipe._id} className="saved-recipe-card">
                    <div className="recipe-card-header">
                      <h5>{recipe.name}</h5>
                      <span className="recipe-category">{recipe.category}</span>
                    </div>
                    <div className="recipe-date">📅 {new Date(recipe.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    <div className="recipe-card-stats">
                      <span>🔥 {recipe.nutrition?.calories || 0} cal</span>
                      <span>💪 {recipe.nutrition?.protein || 0}g</span>
                      <span>🍽️ {recipe.servings} servings</span>
                      <span>📦 {recipe.ingredients?.length || 0} items</span>
                    </div>
                    <div className="recipe-card-actions">
                      <button onClick={() => loadRecipe(recipe)} className="load-btn">📝 Edit</button>
                      <button onClick={() => addRecipeToMeal('breakfast')} className="use-btn">🌅</button>
                      <button onClick={() => addRecipeToMeal('lunch')} className="use-btn">☀️</button>
                      <button onClick={() => addRecipeToMeal('dinner')} className="use-btn">🌙</button>
                      <button onClick={() => deleteRecipe(recipe._id)} className="delete-btn">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}