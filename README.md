# Notion Emoji AI Picker

A Chrome extension that uses AI to suggest relevant emojis for your Notion pages.

## Project Structure

```
notion-emoji-ai-picker/
├── backend/              # Flask server for handling OpenAI requests
│   ├── server.py        # Main Flask application
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables (OpenAI API key)
│
└── extension/           # Chrome extension files
    ├── popup.html      # Extension popup UI
    └── popup.js        # Extension popup logic
```

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the Flask server:
   ```bash
   python server.py
   ```

The server will run on `http://localhost:5000`.

### Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension` directory

## Usage

1. Make sure the Flask backend is running
2. Navigate to any Notion page
3. Click the extension icon in your browser
4. Select one of the AI-suggested emojis for your page

## Development

- Backend: Flask server handles OpenAI API requests and emoji suggestions
- Frontend: Chrome extension communicates with both Notion and the backend server
- API: Single endpoint `/getEmojiSuggestion` for emoji suggestions

## Security Note

The OpenAI API key is stored securely in the backend `.env` file and is never exposed to the frontend.

## Features

- Automatically suggests 5 relevant emojis based on your Notion page title
- Seamlessly integrates with Notion's existing emoji picker
- Easy to use: just click the emoji picker button, and AI suggestions will appear
- Uses OpenAI's GPT-3.5 API for intelligent emoji suggestions

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing this extension
5. When prompted, enter your OpenAI API key
   - If you need an API key, get one from [OpenAI's website](https://platform.openai.com/api-keys)

## Privacy

This extension only accesses your page titles to generate emoji suggestions. Your data is only sent to OpenAI's API for emoji suggestions and is not stored or used for any other purpose.

## License

MIT License 