# 💠 ZenTask AI - Intelligent Discord Productivity Bot
> Built with ❤️ by Shreyansh Tripathi

ZenTask AI is a state-of-the-art Discord bot that combines **Intelligent Task Management**, **Personalized Notes**, and **AI Vision** into one seamless experience. Powered by Groq and Llama 3, it helps you stay organized through natural conversations and interactive UI.

---

## ✨ Key Features

### 🚀 Smart Productivity
- **Interactive Task List**: Manage your cada with buttons and select menus. No more typing IDs.
- **Natural Language Reminders**: Say `"Remind me in 10 mins to join the meeting"` and get notified.
- **Personalized Notes**: Save quick ideas and notes that follow you everywhere.

### 🧠 Advanced AI & Vision
- **Llama 3 Powered Q&A**: Context-aware AI that remembers your previous questions.
- **Smart OCR (`/ocr-tasks`)**: Take a photo of a physical list and magically convert it into digital tasks.
- **Image Analysis**: Upload screenshots or photos and ask questions about them using Llama 3.2 Vision.

### 🌐 Management Suite
- **Interactive Dashboard**: A premium web interface (`http://localhost:3000`) for real-time analytics and task tracking.
- **User Personalization**: Set your own timezone, language, and preferred AI model using `/settings`.
- **Global Search**: Search the web for real-time information with AI-powered summaries.

---

## 🛠️ Tech Stack
- **Engine**: Node.js & Discord.js (v14)
- **AI Backend**: Groq API (Llama 3.3 70B & 3.2 Vision)
- **Database**: MongoDB (Atlas)
- **Web Dashboard**: Express.js & EJS
- **Real-time Search**: Tavily API

---

## ⚙️ Installation & Setup

1. **Clone the project** and install dependencies:
   ```bash
   npm install
   ```

2. **Configure your environment**:
   Create a `.env` file and add the following keys:
   ```env
   DISCORD_TOKEN=your_token
   DISCORD_CLIENT_ID=your_id
   GROQ_API_KEY=your_key
   TAVILY_API_KEY=your_search_key
   MONGODB_URI=your_mongodb_atlas_string
   ```

3. **Deploy the commands**:
   ```bash
   npm run deploy
   ```

4. **Launch the bot**:
   ```bash
   npm run start
   ```

---

## 📱 Slash Commands
- `/task [add|list|done|delete|clear]` - Task management suite.
- `/note [add|view|delete|clear]` - Personalized note-taking.
- `/ocr-tasks [image]` - Convert photos to tasks.
- `/ask [query] [image]` - Talk to the AI (supports visual inputs).
- `/settings` - Personalize your bot experience.
- `/help` - View complete documentation.

---

## 📊 Performance Dashboard
Monitor your server's productivity in real-time at:
**[http://localhost:3000](http://localhost:3000)**

---
Developed by **Shreyansh Tripathi**. 
*Modernizing the way your community stays organized.*
