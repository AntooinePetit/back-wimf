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
