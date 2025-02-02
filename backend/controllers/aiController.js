const { Groq } = require('groq-sdk');
const groq = new Groq();

exports.autoComplete = async (req, res) => {
  const { code } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Suggest code completions for:\n${code}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 50,
    });
    res.json({ suggestions: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};

exports.lint = async (req, res) => {
  const { code } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Analyze this code for syntax errors and suggest fixes:\n${code}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 100,
    });
    res.json({ fixes: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error linting code:', error);
    res.status(500).json({ error: 'Failed to lint code' });
  }
};

exports.generateDocs = async (req, res) => {
  const { code } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Generate documentation for this code:\n${code}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 300,
    });
    res.json({ docs: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating docs:', error);
    res.status(500).json({ error: 'Failed to generate docs' });
  }
};

exports.generateSnippet = async (req, res) => {
  const { description } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful code assistant.' },
        { role: 'user', content: `Generate a code snippet for: ${description}` },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 200,
    });
    res.json({ snippet: chatCompletion.choices[0].message.content });
  } catch (error) {
    console.error('Error generating snippet:', error);
    res.status(500).json({ error: 'Failed to generate snippet' });
  }
};