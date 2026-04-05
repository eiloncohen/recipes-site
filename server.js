const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipes';

// ===== Connect to MongoDB =====
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ מחובר ל-MongoDB'))
  .catch(err => console.error('❌ שגיאת חיבור ל-MongoDB:', err));

// ===== Recipe Schema =====
const recipeSchema = new mongoose.Schema({
  title:        { type: String, required: true, trim: true },
  description:  { type: String, default: '', trim: true },
  ingredients:  { type: [String], required: true },
  instructions: { type: [String], required: true },
  prepTime:     { type: String, default: '', trim: true },
  category:     { type: String, default: 'כללי', trim: true },
}, { timestamps: true });

const Recipe = mongoose.model('Recipe', recipeSchema);

// ===== Middleware =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== GET /recipes =====
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בטעינת המתכונים' });
  }
});

// ===== GET /recipes/:id =====
app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'מתכון לא נמצא' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בטעינת המתכון' });
  }
});

// ===== POST /recipes =====
app.post('/recipes', async (req, res) => {
  try {
    const { title, description, ingredients, instructions, prepTime, category } = req.body;

    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: 'שדות חובה חסרים: שם, מצרכים, אופן הכנה' });
    }

    const recipe = new Recipe({
      title,
      description,
      ingredients: Array.isArray(ingredients)
        ? ingredients
        : ingredients.split('\n').map(i => i.trim()).filter(Boolean),
      instructions: Array.isArray(instructions)
        ? instructions
        : instructions.split('\n').map(i => i.trim()).filter(Boolean),
      prepTime,
      category: category || 'כללי',
    });

    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בשמירת המתכון' });
  }
});

// ===== PUT /recipes/:id =====
app.put('/recipes/:id', async (req, res) => {
  try {
    const { title, description, ingredients, instructions, prepTime, category } = req.body;

    const update = {
      ...(title        && { title }),
      ...(description  !== undefined && { description }),
      ...(prepTime     !== undefined && { prepTime }),
      ...(category     && { category }),
      ...(ingredients  && {
        ingredients: Array.isArray(ingredients)
          ? ingredients
          : ingredients.split('\n').map(i => i.trim()).filter(Boolean)
      }),
      ...(instructions && {
        instructions: Array.isArray(instructions)
          ? instructions
          : instructions.split('\n').map(i => i.trim()).filter(Boolean)
      }),
    };

    const updated = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'מתכון לא נמצא' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'שגיאה בעדכון המתכון' });
  }
});

// ===== DELETE /recipes/:id =====
app.delete('/recipes/:id', async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'מתכון לא נמצא' });
    res.json({ message: 'המתכון נמחק בהצלחה' });
  } catch (err) {
    res.status(500).json({ error: 'שגיאה במחיקת המתכון' });
  }
});

// ===== Catch-all =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍳 שרת המתכונים רץ על http://localhost:${PORT}`);
});