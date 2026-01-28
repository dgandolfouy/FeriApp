import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

export const generateProductDescription = async (productName: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key not found for Gemini");
    return "Descripción no disponible (Falta API Key).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe una descripción corta, atractiva y vendedora (máximo 2 frases) para un producto de feria vecinal llamado: "${productName}". 
      El tono debe ser amable, como de una abuela o un vendedor de confianza. Resalta la frescura o calidad.`,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return "Producto fresco y de excelente calidad, seleccionado especialmente para ti.";
  }
};
