const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const RECIPES_FILE = path.join(__dirname, 'recipes.json');

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Helper: Read recipes from file
function readRecipes() {
  try {
    if (!fs.existsSync(RECIPES_FILE)) {
      fs.writeFileSync(RECIPES_FILE, '[]', 'utf8');
    }
    const data = fs.readFileSync(RECIPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading recipes:', err);
    return [];
  }
}

// Helper: Write recipes to file
function writeRecipes(recipes) {
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2), 'utf8');
}

// GET /recipes - Return all recipes
app.get('/recipes', (req, res) => {
  const recipes = readRecipes();
  res.json(recipes);
});

// GET /recipes/:id - Return single recipe
app.get('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));
  if (!recipe) return res.status(404).json({ error: 'מתכון לא נמצא' });
  res.json(recipe);
});

// POST /recipes - Add new recipe
app.post('/recipes', (req, res) => {
  const { title, description, ingredients, instructions, prepTime, category } = req.body;

  if (!title || !ingredients || !instructions) {
    return res.status(400).json({ error: 'שדות חובה חסרים: שם, מצרכים, אופן הכנה' });
  }

  const recipes = readRecipes();
  const newRecipe = {
    id: recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
    title: title.trim(),
    description: description?.trim() || '',
    ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split('\n').map(i => i.trim()).filter(Boolean),
    instructions: Array.isArray(instructions) ? instructions : instructions.split('\n').map(i => i.trim()).filter(Boolean),
    prepTime: prepTime?.trim() || '',
    category: category?.trim() || 'כללי',
    createdAt: new Date().toISOString()
  };

  recipes.unshift(newRecipe);
  writeRecipes(recipes);
  res.status(201).json(newRecipe);
});

// PUT /recipes/:id - Update recipe
app.put('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'מתכון לא נמצא' });

  const { title, description, ingredients, instructions, prepTime, category } = req.body;
  recipes[index] = {
    ...recipes[index],
    title: title?.trim() || recipes[index].title,
    description: description?.trim() || recipes[index].description,
    ingredients: ingredients ? (Array.isArray(ingredients) ? ingredients : ingredients.split('\n').map(i => i.trim()).filter(Boolean)) : recipes[index].ingredients,
    instructions: instructions ? (Array.isArray(instructions) ? instructions : instructions.split('\n').map(i => i.trim()).filter(Boolean)) : recipes[index].instructions,
    prepTime: prepTime?.trim() || recipes[index].prepTime,
    category: category?.trim() || recipes[index].category,
    updatedAt: new Date().toISOString()
  };

  writeRecipes(recipes);
  res.json(recipes[index]);
});

// DELETE /recipes/:id - Delete recipe
app.delete('/recipes/:id', (req, res) => {
  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'מתכון לא נמצא' });

  recipes.splice(index, 1);
  writeRecipes(recipes);
  res.json({ message: 'המתכון נמחק בהצלחה' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍳 שרת המתכונים רץ על http://localhost:${PORT}`);
});
