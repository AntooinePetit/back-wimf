const db = require("../db");

exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await db.many(`SELECT i.name_ingredient, c.name_ingredient_category 
      FROM ingredients AS i 
      LEFT JOIN ingredient_categories AS c 
      ON i.fk_id_ingredient_category = c.id_ingredient_category`)

    res.status(200).json(ingredients)
  } catch (err) {
    return res.status(500).json({message: err.message})    
  }
}