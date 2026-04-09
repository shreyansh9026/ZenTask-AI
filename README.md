# 💠 ZenTask AI - Intelligent Discord Productivity Ecosystem
> Built with ❤️ by Shreyansh Tripathi

ZenTask AI is a professional Discord bot that combines **Intelligent Task Management**, **Personalized Notes**, and **Multi-Modal AI Vision & Voice** into one seamless experience. Powered by Groq (Llama 3) and MongoDB Atlas, it handles everything from your daily to-dos to advanced server analytics.

---

## ✨ Key Features

### 🚀 Smart Productivity
- **Interactive Task List**: Manage your tasks with buttons and select menus. No more typing IDs—just click to mark as "Done."
- **Shared Project Lists**: Collaborative server-wide task tracking with `/task shared-list`.
- **Natural Language Reminders**: Say `"Remind me in 10 mins to join the meeting"` and get notified instantly.
- **Smart Categorization**: AI automatically tags your tasks (e.g., #Work, #Personal, #Digital) using semantic analysis.

### 🧠 Advanced AI & Vision
- **Voice-to-Task Intelligence**: record an audio note on mobile or desktop, and the bot will transcribe and add it to your tasks automatically.
- **AI Vision Core**: Upload screenshots or photos and ask questions using Llama 3.2 11B Vision.
- **Smart OCR (`/ocr-tasks`)**: Take a photo of a physical list (handwritten or typed) and magically convert it into digital tasks.
- **Context-Aware Q&A**: Persistent chat memory that remembers your last 10 interactions.

### 🛡️ Admin & Analytics
- **AI Safety Audit**: Use `/safety` to analyze channel sentiment, detect toxicity, and audit recently chat vibes.
- **Interactive Dashboard**: A premium web interface for viewing real-time productivity stats at `http://localhost:3000`.
- **Global Search**: Search the web with **Advanced Depth** for live sports scores, news, and factual data.

---

## 🛠️ Tech Stack
- **Engine**: Node.js & Discord.js (v14)
- **AI Backend**: Groq API (Llama 3.3 70B, 3.2 Vision, Whisper-v3)
- **Database**: MongoDB Atlas (Cloud Persistence)
- **Web Interface**: Express.js & EJS
- **Real-time Engine**: Tavily Advanced Search

---

## ⚙️ Installation & Setup

1. **Clone the project** and install dependencies:
   ```bash
   npm install
   ```

2. **Configure your environment**:
   Create a `.env` file and add the following keys (see `.env.example` for reference):
   ```env
   DISCORD_TOKEN=your_token
   GROQ_API_KEY=your_key
   TAVILY_API_KEY=your_key
   MONGODB_URI=your_atlas_connection_string
   ```

3. **Deploy the Slash Commands**:
   ```bash
   npm run deploy
   ```

4. **Launch the Masterpiece**:
   ```bash
   npm run start
   ```

---

## 📱 Slash Commands
| Command | Description |
| --- | --- |
| `/task [add|list|done|delete|clear]` | Full task management suite |
| `/task shared-list` | Server-wide collaborative project list |
| `/note [add|view|delete|clear]` | Personalized note-taking |
| `/ocr-tasks [image]` | Extract and import tasks from physical photos |
| `/ask [query] [image]` | AI Chat (supports Voice transcriptions) |
| `/safety` | AI-powered channel toxicity & vibe audit |
| `/search [query]` | Advanced real-time web search (Live Scores/News) |
| `/settings` | Personalize your timezone and AI model |

---

## 📊 Productivity Dashboard
Monitor your server's productivity metrics in real-time at:
**[http://localhost:3000](http://localhost:3000)**

---
Developed by **Shreyansh Tripathi**. 
*Modernizing productivity, one interaction at a time.*
