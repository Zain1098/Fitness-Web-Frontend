import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api/client.js'
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

  const units = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice']
  const categories = [
    { value: 'breakfast', label: '🌅 Breakfast' },
    { value: 'lunch', label: '☀️ Lunch' },
    { value: 'dinner', label: '🌙 Dinner' },
    { value: 'snack', label: '🍎 Snack' },
    { value: 'dessert', label: '🍰 Dessert' },
    { value: 'drink', label: '🥤 Drink' }
  ]

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

      await api('/recipes', {
        method: 'POST',
        body: recipeData,
        token
      })

      // Reset form
      setRecipe({
        name: '',
        servings: 1,
        ingredients: [],
        instructions: '',
        category: 'main_course'
      })

      alert('Recipe saved successfully!')
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
      await api('/nutrition', {
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

  return (
    <div className="recipe-builder">
      <div className="builder-header">
        <h3>👨‍🍳 Recipe Builder</h3>
        <p>Create custom recipes and track their nutrition</p>
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
          <h4>🥘 Ingredients</h4>

          <div className="ingredient-form">
            <input
              type="text"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ingredient name (e.g., Chicken Breast)"
              className="form-input ingredient-name-input"
            />
            <div className="ingredient-row">
              <input
                type="number"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Quantity"
                className="form-input"
              />
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
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
              />
              <input
                type="number"
                value={newIngredient.protein}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, protein: e.target.value }))}
                placeholder="Protein (g)"
                className="form-input"
              />
              <input
                type="number"
                value={newIngredient.carbs}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, carbs: e.target.value }))}
                placeholder="Carbs (g)"
                className="form-input"
              />
              <input
                type="number"
                value={newIngredient.fats}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, fats: e.target.value }))}
                placeholder="Fats (g)"
                className="form-input"
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
      </div>
    </div>
  )
}