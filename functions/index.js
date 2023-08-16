const functions = require("firebase-functions");
const bodyParser = require("body-parser");
const Configuration = require("openai").Configuration;
const OpenAIApi = require("openai").OpenAIApi;
const PineconeClient = require("@pinecone-database/pinecone").PineconeClient;
const dotenv = require("dotenv");
const cors = require("cors");

const corsHandler = cors({
  origin: [
    "http://localhost:3000",
    "https://travelfoodie-prompter-7fc1f.web.app",
  ],
});

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENV = process.env.PINECONE_ENV;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const MODEL = process.env.MODEL;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const pinecone = new PineconeClient();

exports.search = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    await pinecone.init({
      environment: PINECONE_ENV,
      apiKey: PINECONE_API_KEY,
    });
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    const query = req.query.query;
    console.log("Query:", req.query);
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    try {
      // Use OpenAI's Ada model to get the completion
      const openAIResponse = await openai.createEmbedding({
        input: query,
        model: MODEL,
      });

      console.log("OpenAI response:", openAIResponse.data.data);
      const queryVector = openAIResponse.data.data[0].embedding;
      const queryRequest = {
        vector: queryVector,
        topK: 3,
        includeValues: true,
        includeMetadata: true,
      };
      // Use Pinecone to search the vector database
      const pineconeResponse = await index.query({ queryRequest });
      const response = [];
      console.log("Pinecone response:", pineconeResponse);
      pineconeResponse.matches.map((result) => {
        response.push({
          id: result.id,
          score: result.score,
          text: result.metadata.text,
          country: result.metadata.country,
        });
      });
      res.json(response);
    } catch (error) {
      console.error("Error performing semantic search:", error);
      res.status(500).json({ error: "Failed to perform search." });
    }
  });
});
