# English Text Simplifier

Chrome extension for simplifying English texts using OpenAI GPT-4o-mini.

## Features

- 🔤 **Intelligent simplification** - Uses OpenAI GPT-4o-mini to analyze and simplify text
- 📊 **CEFR levels** - Adjust text to A1, A2, B1, B2, C1 levels
- 🎨 **Modern interface** - Beautiful design with animations and effects
- 🔄 **Original text toggle** - Option to show/hide original text
- 💾 **Settings storage** - Automatic saving of preferences

## Installation

1. **Install extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

2. **Configure API key**:
   - Click the extension icon in the toolbar
   - Enter your OpenAI API key in the "API Key" field
   - Click "Save API Key"
   - The key is stored securely in Chrome's local storage

## Usage

1. **Go to a page** with English text
2. **Click the extension icon** in the toolbar
3. **Select simplification level** (A1-C1)
4. **Click "Simplify Text"**
5. **Wait** for AI processing

## CEFR Levels

- **A1** - Basic vocabulary, simple sentences
- **A2** - Everyday vocabulary, basic grammatical structures
- **B1** - Intermediate vocabulary, complex sentences
- **B2** - Rich vocabulary, diverse structures
- **C1** - Advanced vocabulary, complex structures

## API Key Configuration

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and generate an API key
3. Click the extension icon in the toolbar
4. Enter your API key in the "API Key" field
5. Click "Save API Key"
6. The key is stored securely and automatically used for all requests

## Costs

The extension uses OpenAI API which is paid:
- GPT-4o-mini: ~$0.15 per 1M input tokens
- Typical page: ~$0.01-0.05 per simplification

## Security

- API key is stored securely in Chrome's local storage
- Never hardcoded in the extension files
- Used only for communication with OpenAI API
- Not sent to any other servers
- Can be easily changed through the extension interface

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `popup.html/js` - User interface (including API key management)
- `contentScript.js` - Text simplification logic
- `background.js` - Service worker

## License

MIT License - use freely!
