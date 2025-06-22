const express = require('express');
const OpenAI = require('openai');
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI (you'll need to set OPENAI_API_KEY environment variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// GPT-powered free roam endpoint
app.post('/api/free-roam', async (req, res) => {
  try {
    const { action, playerStats, storyContext } = req.body;
    
    const prompt = `You are narrating a Hunger Games interactive story. The player is in the arena and has typed: "${action}"

Player Stats:
- Name: ${playerStats.name}
- District: ${playerStats.district}
- Age: ${playerStats.age}
- Health: ${playerStats.health}
- Weapon: ${playerStats.weapon}
- Inventory: ${playerStats.inventory}
- Training Score: ${playerStats.trainingScore}
- Sponsor Points: ${playerStats.sponsorPoints} (hidden from player)

Story Context: ${storyContext}

Write a 2-3 sentence response describing what happens when the player tries this action. Make it immersive, dramatic, and appropriate for the Hunger Games setting. The response should be realistic and could have consequences (good or bad) for the player. Consider that higher sponsor points and training scores might influence how sponsors and other tributes react to the player.

Response:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller for an interactive Hunger Games adventure. Write engaging, dramatic responses that fit the tone and setting of the Hunger Games universe. Consider the player's training score and sponsor points when crafting responses - higher scores might lead to more favorable outcomes or sponsor attention."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    const response = completion.choices[0].message.content;
    res.json({ response });
  } catch (error) {
    console.error('GPT API Error:', error);
    res.json({ 
      response: "You try the action, but something unexpected happens. The arena is full of surprises." 
    });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
