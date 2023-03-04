import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key no configurado, por favor sigue las instrucciones en README.md",
      }
    });
    return;
  }

  const text = req.body.text || '';
  if (text.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Ingresa un texto válido para que funcione. :)",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(text),
      temperature: 0.6,
      max_tokens: 500,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error con la respuesta de OpenAI API: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'A ocurrido un error durante la respuesta.',
        }
      });
    }
  }
}

function generatePrompt(text) {
  const capitalizedText =
    text[0].toUpperCase() + text.slice(1).toLowerCase();

  // Si el texto contiene una lista, agregar el carácter de lista a cada elemento
  if (/\n\s*[-*+]\s/.test(text)) {
    const items = text.split('\n').map((line) => line.trim());
    const formattedItems = items.map((item) => `• ${item.slice(2)}`);
    return formattedItems.join('\n');
  }

  return capitalizedText;
}
