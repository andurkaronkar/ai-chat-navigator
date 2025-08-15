# AI Chat Navigator

> **Why I Built This**: I found similar extensions online, but they didn't work the way I wanted. Most were clunky, had poor detection, or cluttered the interface. So I decided to create my own clean, efficient solution.

A Chrome extension that works across **all major AI chat platforms**. It acts as your **personal prompt library**, automatically extracting and listing all your prompts/questions in a clean sidebar, letting you instantly jump to any part of your conversations.

![Extension Demo](https://via.placeholder.com/600x300?text=Extension+Demo+Screenshot)

## ✨ What It Does

**🎯 Universal Platform Support**
- Works on **ChatGPT**, **Claude**, **Gemini**, **Perplexity**, **Poe**, **Character.AI**, and more
- Automatically detects which AI platform you're using
- Platform-specific optimization for accurate prompt extraction
- Smart fallback for any chat interface

**🎮 One-Click Navigation**
- Click any prompt in the sidebar → instantly scroll to that conversation
- Visual highlighting shows exactly where you are
- Perfect for long chat sessions with multiple topics

**🎨 Clean Interface**
- Floating, draggable icon that stays out of your way
- Sidebar doesn't blur or interfere with ChatGPT
- Glassmorphism design that looks modern and professional

**⚡ Smart Features**
- Remembers icon position across page reloads
- Click outside sidebar to close, ESC key support
- Dark mode compatible
- Responsive design works on any screen size

## 🚀 Installation

### Option 1: Install from Chrome Web Store
*Coming soon - extension will be published after testing*

### Option 2: Install as Developer Extension

1. **Download or Clone**
   ```bash
   git clone https://github.com/yourusername/chatgpt-prompt-navigator.git
   ```
   Or download the ZIP file and extract it.

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" and select the extension folder
   - You should see the extension appear in your extensions list

3. **Start Using**
   - Visit any supported AI chat platform:
     - **ChatGPT** (chatgpt.com)
     - **Claude** (claude.ai)
     - **Gemini** (gemini.google.com)
     - **Perplexity** (perplexity.ai)
     - **And many more!**
   - Look for the floating prompt icon on the right side
   - Start chatting and watch your prompts get automatically indexed!

*Note: The extension comes with simple icon files pre-created, so no additional setup needed.*

## 🎮 How to Use

### First Time Setup
1. **Visit Any AI Chat Platform** → ChatGPT, Claude, Gemini, Perplexity, etc.
2. **Start a conversation** → Ask the AI some questions
3. **Look for the floating icon** → You'll see a glassmorphism-styled icon on the right side

### Daily Usage
1. **🎯 Automatic Detection** → As you chat, the extension automatically finds your prompts
2. **📋 View Your Prompts** → Click the floating icon to see your conversation history
3. **🎪 Navigate Instantly** → Click any prompt to jump to that part of the conversation
4. **🎨 Customize Position** → Drag the icon anywhere you want (it remembers your preference)

### Pro Tips
- **Multiple Topics?** Perfect for long conversations covering different subjects
- **Lost in Chat?** Use the sidebar to quickly find where you asked about something specific  
- **Research Sessions?** Great for organizing complex Q&A sessions across different AI platforms
- **Platform Switching?** Use the same tool whether you're on ChatGPT, Claude, or Gemini
- **Review & Reference** → Easily jump back to see any AI's response to your specific questions

## 🔧 How It Works

### The Problem I Solved
Most prompt navigator extensions I found online were either:
- ❌ **Too intrusive** - blocking the webpage or adding annoying overlays
- ❌ **Poor detection** - picking up random text instead of actual prompts
- ❌ **Ugly interfaces** - looked like they were built in 2010
- ❌ **Overcomplicated** - trying to do too many things at once

### My Solution
**🎯 Universal Platform Detection**
- **Auto-detects** which AI platform you're using (ChatGPT, Claude, Gemini, etc.)
- **Platform-specific extraction** using each site's unique DOM structure:
  - ChatGPT: `data-message-author-role="user"`
  - Claude: `data-is-author="human"`
  - Gemini: `data-response-type="user"`
  - And many more platform-specific selectors
- **Smart filtering** removes AI responses, code snippets, and technical content
- Only shows YOUR actual questions and prompts

**🎨 Clean, Minimal Design**
- Floating icon stays out of your way
- Sidebar slides in smoothly without disrupting your workflow
- No webpage blur or overlay - ChatGPT stays fully usable
- Glassmorphism styling that looks modern and professional

**⚡ Smart Functionality**
- Click outside to close (intuitive UX)
- Navigate to prompts without closing sidebar (efficient workflow)
- Remembers your icon position
- Works on both light and dark themes

### Technical Stack
- **Manifest V3** - Latest Chrome extension standard
- **Vanilla JavaScript** - No heavy frameworks, fast and lightweight
- **CSS3** - Modern glassmorphism effects with smooth animations
- **DOM API** - Direct integration with all major AI chat interfaces

## 🛠 Customization

### For Developers

Want to modify the extension? Here's where to look:

**🎯 Detection Logic** (`content.js`)
```javascript
// Add support for new platforms
function getPlatformSelectors(platform) {
  const selectors = {
    chatgpt: ['[data-message-author-role="user"]'],
    claude: ['[data-is-author="human"]'],
    gemini: ['[data-response-type="user"]'],
    yourplatform: ['your-custom-selectors'] // Add new platform
  };
}

// Platform-specific confidence scoring
function calculateChatPromptConfidence(text, element, platform) {
  // Customize scoring per platform
}
```

**🎨 Visual Styling** (`styles.css`)
```css
/* Customize sidebar appearance */
.prompt-extractor-sidebar {
  width: 320px; /* Change sidebar width */
  background: rgba(255, 255, 255, 0.95); /* Adjust transparency */
}

/* Modify icon styling */
.prompt-extractor-icon {
  width: 56px; /* Icon size */
  background: rgba(255, 255, 255, 0.2); /* Icon background */
}
```

**⚙️ Configuration** (`content.js`)
```javascript
const CONFIG = {
  iconSize: 56,                    // Icon dimensions
  sidebarWidth: 320,              // Sidebar width
  defaultPosition: { x: -80, y: 100 }, // Starting position
  zIndex: 999999                  // Layer priority
};
```

## 🔒 Privacy & Security

**Your Data Stays Local**
- ✅ **No server communication** - Everything runs locally in your browser
- ✅ **No data collection** - Zero tracking, analytics, or telemetry
- ✅ **No account required** - Works immediately without signup
- ✅ **Minimal permissions** - Only requests what's absolutely necessary

**What Gets Stored**
- 🔹 **Icon position** - Saved locally to remember where you placed it
- 🔹 **Nothing else** - No chat content, prompts, or personal data is stored

## 🌐 Compatibility

**Browsers**
- ✅ **Chrome** (Manifest V3 compatible)
- ✅ **Microsoft Edge** (Chromium-based)
- ✅ **Brave Browser**
- ✅ **Other Chromium browsers**

**Supported Platforms**
- ✅ **ChatGPT** (chatgpt.com, chat.openai.com)
- ✅ **Claude** (claude.ai, anthropic.com)
- ✅ **Google Gemini** (gemini.google.com, bard.google.com)
- ✅ **Perplexity AI** (perplexity.ai)
- ✅ **Poe** (poe.com)
- ✅ **Character.AI** (character.ai)
- ✅ **Microsoft Copilot** (copilot.microsoft.com)
- ✅ **You.com** (you.com)
- ⚡ **Generic detection** for any chat interface

## 📁 Project Structure
```
universal-ai-chat-navigator/
├── 📄 manifest.json       # Extension configuration (Manifest V3)
├── 🧠 content.js         # Universal platform detection & extraction (20KB)
├── 🎨 styles.css         # Glassmorphism UI & animations (9KB)
├── 🔧 popup.html         # Extension popup interface
├── 📂 assets/            # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── 📖 README.md          # You're reading this!
└── 📜 LICENSE            # MIT License
```


## 🐛 Troubleshooting

### Common Issues

**❓ Icon not showing up**
- Make sure the extension is enabled in `chrome://extensions/`
- Try refreshing the ChatGPT page
- Check if you're on a supported platform (ChatGPT, Claude, Gemini, etc.)

**❓ No prompts detected**
- Start a conversation on any supported AI platform first
- The extension only shows YOUR prompts, not AI responses
- Check browser console (F12) for debugging info - it shows which platform was detected

**❓ Sidebar won't open**
- Click directly on the floating icon (not drag it)
- Make sure the page has fully loaded
- Try clicking the icon again after a few seconds

**❓ Navigation not working**
- Some platform interface changes may affect navigation
- The extension highlights the prompt area with a purple outline
- Try scrolling manually if auto-scroll doesn't work

### Debug Mode
Open browser console (F12) to see detailed logs:

Detected platform: chatgpt
chatgpt detected - using specialized extraction
Found 3 prompts: How do I..., Can you explain..., What is...

## 🤝 Contributing

Found a bug or want to add a feature? 

1. **Fork the repository**
2. **Make your changes**
3. **Test on multiple AI platforms**
4. **Submit a pull request**

I'm especially interested in:
- 🔍 Better prompt detection algorithms
- 🎨 UI/UX improvements
- 🌐 Support for other AI chat platforms
- 🐛 Bug fixes and performance improvements

## 📄 License

MIT License - Use it, modify it, distribute it freely!

## 💡 Final Thoughts

I built this because existing solutions didn't meet my standards for clean, efficient design. If you're like me and appreciate tools that "just work" without getting in your way, I think you'll love this extension.

Give it a try and let me know what you think! 🚀



*Made with ❤️ for better AI conversations everywhere*
