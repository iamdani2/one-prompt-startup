# One Prompt Startup

A fast, AI-powered single-page app that turns startup ideas into actionable build plans using no-code tools.

## 🚀 What It Does

Enter any startup idea (like "job board for barbers") and get:
- **Recommended Stack**: Popular no-code tools (Notion, Airtable, Webflow, etc.)
- **Build Steps**: 3-5 clear, actionable steps
- **Pro Tips**: Challenges and best practices
- **Resources**: Links to helpful tutorials

## 🛠️ Features

- **AI-Powered**: Uses OpenAI GPT-3.5 for intelligent recommendations
- **Fast & Simple**: Single input, instant results
- **Copy to Clipboard**: Share your build plan easily
- **Dark Mode**: Automatic theme switching
- **History**: Saves your last 5 ideas locally
- **Mobile Responsive**: Works perfectly on all devices

## 🏃‍♂️ Quick Start

### Local Development

1. **Clone and Setup**
   ```bash
   git clone <your-repo>
   cd one-prompt-startup
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

### Deploy to Render

1. **Connect Repository**
   - Visit [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Plan**: `Free` (or your preferred plan)

3. **Set Environment Variables**
   - In Render dashboard, go to Environment tab
   - Add: `OPENAI_API_KEY` = your OpenAI API key
   - Add: `NODE_ENV` = `production`

4. **Custom Domain** (optional)
   - In Render dashboard, go to Settings → Custom Domains
   - Add: `nocode.co.il`

## 🔧 Configuration

### OpenAI API Key
Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)

## 📁 Project Structure

```
one-prompt-startup/
├── index.html                  # Main frontend
├── script.js                   # Frontend JavaScript
├── server.js                   # Express.js server
├── package.json                # Dependencies & scripts
├── render.yaml                 # Render deployment config
├── .env.example                # Environment variables template
├── claude_workflow_rules.md    # Development guidelines
└── README.md                   # This file
```

## 🎯 API Endpoint

**POST** `/api/generate`

```json
{
  "prompt": "job board for barbers"
}
```

**Response:**
```json
{
  "tools": ["Notion", "Super.so", "Tally"],
  "steps": ["Create Notion database", "Make it public with Super", "Add submission form"],
  "notes": ["Won't scale past 5K items"],
  "links": ["https://super.so/guide"]
}
```

## 🌟 Tech Stack

- **Frontend**: HTML, TailwindCSS, Vanilla JavaScript
- **Backend**: Express.js (Node.js)
- **AI**: OpenAI GPT-3.5 Turbo
- **Deployment**: Render
- **Storage**: localStorage (for history)

## 📱 Browser Support

- Chrome/Edge 88+
- Firefox 84+
- Safari 14+

## 🔒 Privacy

- No user data is stored on servers
- Search history saved locally only
- OpenAI processes prompts according to their privacy policy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own projects!

---

**Made with ☕ in Tel Aviv** | [nocode.co.il](https://nocode.co.il)