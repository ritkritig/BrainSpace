const { GoogleGenerativeAI } = require('@google/generative-ai');
const Note = require('../models/Note');

/**
 * Strips HTML tags from TipTap-generated HTML content.
 * Gemini works better on plain text than raw HTML.
 */
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * @desc    Summarize a note using the Gemini API
 * @route   POST /api/ai/summarize
 * @access  Private
 */
const summarizeNote = async (req, res) => {
  const { noteId } = req.body;

  if (!noteId) {
    return res.status(400).json({ success: false, message: 'noteId is required.' });
  }

  try {
    // Verify the note belongs to the requesting user
    const note = await Note.findOne({ _id: noteId, owner: req.user._id });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    const plainText = stripHtml(note.content);

    if (!plainText || plainText.length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Note content is too short to summarize. Please add more content.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please set GEMINI_API_KEY.',
      });
    }

    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an intelligent note summarizer. Analyze the following note and provide a structured response.

Note Title: "${note.title}"
Note Content: "${plainText}"

Respond ONLY with a valid JSON object in this exact format (no markdown, no backticks):
{
  "summary": "A concise 2-3 sentence summary of the note's main points",
  "keyPoints": [
    "First key point",
    "Second key point",
    "Third key point",
    "Fourth key point (if applicable)",
    "Fifth key point (if applicable)"
  ]
}

Keep key points brief, actionable, and insightful. Limit to 3-5 key points.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse the JSON response from Gemini
    let parsed;
    try {
      // Handle cases where Gemini wraps in markdown code blocks
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Fallback: return raw text as summary if parsing fails
      parsed = {
        summary: responseText.substring(0, 300),
        keyPoints: ['Unable to extract key points. Please try again.'],
      };
    }

    // Cache summary in the note document
    note.aiSummary = {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      generatedAt: new Date(),
    };
    await note.save();

    res.status(200).json({
      success: true,
      noteId: note._id,
      summary: parsed.summary,
      keyPoints: parsed.keyPoints,
      generatedAt: note.aiSummary.generatedAt,
    });
  } catch (error) {
    console.error('AI summarize error:', error);

    // Handle Gemini API specific errors
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'AI rate limit reached. Please wait a moment and try again.',
      });
    }
    if (error.status === 403) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Gemini API key. Please check your configuration.',
      });
    }

    res.status(500).json({ success: false, message: 'Server error during AI summarization.' });
  }
};

module.exports = { summarizeNote };
