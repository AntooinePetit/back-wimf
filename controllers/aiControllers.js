const { GoogleGenAI } = require("@google/genai");

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 Mo

const FORBIDDEN_INGREDIENTS = [
  "récipient",
  "emballage",
  "bouteille",
  "boite",
  "boîte",
  "pot",
  "bocal",
  "etiquette",
  "étiquette",
  "sachet",
  "film",
  "carton",
  "pack",
  "canette",
  "couvercle",
  "plateau",
  "tiroir",
  "tupperware",
  "main",
  "doigt",
  "doigts",
  "main humaine",
  "ombre",
  "fond",
  "table",
];

exports.getIngredientsFromPicture = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { picture } = req.body;

    // Validation de base
    if (!picture || typeof picture !== "string") {
      return res.status(400).json({ error: "Aucune image valide fournie." });
    }

    const cleanedBase64 = picture.replace(/^data:image\/\w+;base64,/, "");

    // Vérification base64
    const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(cleanedBase64);
    if (!isBase64) {
      return res.status(400).json({ error: "Format Base64 invalide." });
    }

    // Taille limite
    const imageBuffer = Buffer.from(cleanedBase64, "base64");
    if (imageBuffer.length > MAX_IMAGE_SIZE) {
      return res.status(413).json({ error: "Image trop lourde (4Mo max)." });
    }

    // Prompts
    const contents = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanedBase64,
        },
      },
      {
        text: `
Tu es un assistant qui liste uniquement les ingrédients visibles ou mentionnés, en français. 
- Ne fais jamais de traduction vers l’anglais. 
- Ne crée pas de mots inventés, incomplets ou des variantes inutiles. 
- Répond uniquement avec un JSON strictement valide. 
- La clé doit être "ingredients" et la valeur un tableau de chaînes de caractères.
- Ne mets que les ingrédients réels, exactement comme ils apparaissent, sans commentaires, sans clés supplémentaires.

Exemple de sortie correcte : 
{
  "ingredients": ["crème fraîche", "carottes", "lentilles", "bière"]
}

        `,
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
      generationConfig: { temperature: 0.1 },
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return res.status(500).json({ error: "Réponse IA vide ou invalide." });
    }

    // Parsing JSON
    const cleanJsonText = resultText
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    let ingredientsJson;
    try {
      ingredientsJson = JSON.parse(cleanJsonText);
    } catch (err) {
      return res.status(500).json({
        error: "La réponse IA n'est pas un JSON valide.",
        raw: resultText,
      });
    }

    if (
      !ingredientsJson.ingredients ||
      !Array.isArray(ingredientsJson.ingredients)
    ) {
      return res.status(500).json({
        error: "Format JSON incorrect.",
        raw: ingredientsJson,
      });
    }

    // Normalisation
    const normalize = (str) =>
      str.toLowerCase().trim().replace(/[()]/g, "").replace(/\s+/g, " ");

    let ingredients = ingredientsJson.ingredients.map(normalize);

    // Filtrage des ingrédients interdits
    ingredients = ingredients.filter(
      (ing) => ing && !FORBIDDEN_INGREDIENTS.includes(ing) && ing.length > 1
    );

    // Remove duplicates
    ingredients = [...new Set(ingredients)];

    return res.json({ ingredients });
  } catch (err) {
    console.error("Erreur IA :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.createRecipeFromIngredients = async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { ingredients } = req.body;

    // Validation basique
    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res.status(400).json({ error: "Aucun ingrédient valide fourni." });
    }

    // Prompt IA
    const contents = [
      {
        text: `
Tu es un assistant culinaire expert.
Tu dois générer UNE recette qui utilise UNIQUEMENT les ingrédients suivants :
${JSON.stringify(ingredients, null, 2)}

Répond STRICTEMENT avec un JSON valide et rien d'autre.
N'ajoute aucun texte avant ou après.

FORMAT EXACT ATTENDU :

{
  "ingredients": [
    {
      "name_ingredient": "string",
      "quantity": number,
      "measurements": "string"
    }
  ],
  "recipe": {
    "name_recipe": "string",
    "preparation_time": number,
    "cooking_time": number,
    "resting_time": number,
    "instructions": {
      "steps": ["string", "string", "string"]
    },
    "servings_recipe": number,
    "nutritional_values_recipe": {
      "totalFat": {"name": "Matières grasses totales", "quantity": number, "unit": "g"},
      "saturatedFat": {"name": "Acides gras saturés", "quantity": number, "unit": "g"},
      "cholesterol": {"name": "Cholestérol", "quantity": number, "unit": "mg"},
      "sodium": {"name": "Sodium", "quantity": number, "unit": "mg"},
      "totalCarbohydrate": {"name": "Glucides totaux", "quantity": number, "unit": "g"},
      "dietaryFiber": {"name": "Fibres alimentaires", "quantity": number, "unit": "g"},
      "totalSugars": {"name": "Sucres totaux", "quantity": number, "unit": "g"},
      "protein": {"name": "Protéines", "quantity": number, "unit": "g"},
      "calcium": {"name": "Calcium", "quantity": number, "unit": "mg"},
      "iron": {"name": "Fer", "quantity": number, "unit": "mg"},
      "potassium": {"name": "Potassium", "quantity": number, "unit": "mg"},
      "calories": {"name": "Calories", "quantity": number, "unit": "kcal"}
    }
  }
}

CONTRAINTES IMPORTANTES :
- Le JSON doit être parfaitement valide.
- "ingredients" doit être un tableau d’objets, un pour chaque ingrédient fourni.
- "name_ingredient" doit correspondre EXACTEMENT aux ingrédients fournis (en minuscules si nécessaire).
- "quantity" : mettre 0 si la quantité n’est pas explicitable.
- "measurements" : indiquer une unité réaliste ("g", "ml", "pièce", etc.). Si inconnu → "" (chaîne vide).
- Dans "recipe", n'utilise QUE ces ingrédients.
- Pour les valeurs nutritionnelles, si l’IA n’est pas certaine → mettre "quantity": 0.
- AUCUNE clé supplémentaire.
- AUCUN texte autour, strict JSON.

### Règles pour les ingrédients :
- Tu dois extraire tous les ingrédients mentionnés dans la recette.
- S'il manque la quantité ou l'unité dans le texte, tu dois FAIRE UNE ESTIMATION COHÉRENTE pour une préparation de 2 personnes.
- Il est strictement interdit d'utiliser quantity = 0 ou measurements = "" sauf si l’ingrédient ne peut vraiment pas être quantifié (ex : "sel" → mettre une estimation comme "1 pincée").
- Toujours donner une unité logique (“g”, “ml”, “c.à.s”, “c.à.c”, “pincée”, “unité”, etc.).
- Les quantités doivent être réalistes (pas 1 g ou 2000 g sans raison).
      `,
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents,
      generationConfig: { temperature: 0.2 },
    });

    const resultText =
      response.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!resultText) {
      return res.status(500).json({ error: "Réponse IA vide ou invalide." });
    }

    // Nettoyage JSON
    const cleanJsonText = resultText
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    let recipeJson;
    try {
      recipeJson = JSON.parse(cleanJsonText);
    } catch (err) {
      return res.status(500).json({
        error: "La réponse IA n'est pas un JSON valide.",
        raw: resultText,
      });
    }

    // Vérification basique du format attendu
    const requiredKeys = ["ingredients", "recipe"];

    for (const key of requiredKeys) {
      if (!recipeJson[key]) {
        return res.status(500).json({
          error: `Clé manquante dans le JSON généré : ${key}`,
          raw: recipeJson,
        });
      }
    }

    return res.json(recipeJson);
  } catch (err) {
    console.error("Erreur IA :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
