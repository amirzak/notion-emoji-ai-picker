# Notion Emoji AI Picker

A Chrome extension that automatically suggests emojis for your Notion pages based on their titles using OpenAI's GPT-3.5 API.

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

## Usage

1. Open any Notion page
2. Click the "Add icon" button (the emoji button at the top of the page)
3. The extension will automatically show 5 AI-suggested emojis based on your page title
4. Click any suggested emoji to use it

## Requirements

- A valid OpenAI API key
- Google Chrome browser
- Access to Notion

## Privacy

This extension only accesses your page titles to generate emoji suggestions. Your data is only sent to OpenAI's API for emoji suggestions and is not stored or used for any other purpose.

## License

MIT License 