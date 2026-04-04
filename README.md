# GroqBot - AI Discord Assistant and Task Manager

Designed by Shreyansh Tripathi.

A Discord bot powered by Groq for chat, search summaries, reminders, tasks, notes, and news.

## Project Structure

```text
bot/
|-- logs/                         # Runtime logs
|-- scripts/                      # Manual API test scripts
|-- src/
|   |-- commands/
|   |   |-- ai/
|   |   |   |-- generalQA.js
|   |   |   |-- newsCommand.js
|   |   |   `-- searchCommand.js
|   |   |-- productivity/
|   |   |   |-- noteCommands.js
|   |   |   |-- reminderCommand.js
|   |   |   `-- taskCommands.js
|   |   `-- utility/
|   |       `-- datetimeCommand.js
|   |-- handlers/
|   |   `-- messageHandler.js
|   |-- services/
|   |   |-- ai/
|   |   |   `-- groqService.js
|   |   `-- search/
|   |       `-- searchService.js
|   |-- storage/
|   |   `-- jsonStore.js
|   |-- utils/
|   |   |-- formatter.js
|   |   |-- intentParser.js
|   |   |-- logger.js
|   |   `-- runtimeLock.js
|   `-- index.js
|-- .env.example
|-- package.json
`-- README.md
```

## Features

- General Q&A with Groq
- Live web search summaries
- Latest news with live fallback
- Task management
- Notes
- Natural language reminders
- Date and time command routing

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the env template:

```bash
copy .env.example .env
```

3. Fill in these values:

```env
DISCORD_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
GROQ_API_KEY=your_groq_api_key_here
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_API_KEY=your_tavily_api_key_here
SEARCH_PROVIDER=tavily
BOT_PREFIX=!
MAX_TASKS_PER_USER=20
```

4. Run the bot:

```bash
npm start
```

## Useful Scripts

```bash
npm run dev
npm run test:groq
npm run test:search
```

## Commands

- `!help`
- `!ping`
- `!time`
- `!date`
- `!addtask <text>`
- `!tasks`
- `!donetask <id>`
- `!deletetask <id>`
- `!cleartasks`
- `!addnote <text>`
- `!notes`
- `!deletenote <id>`
- `!clearnotes`
- `!search <query>`
- `!news`
- `!remind me in 10 minutes to call Alice`

## Logging

- App logs are written to `logs/bot-debug.log`
- Runtime lock is stored in `data/bot.lock`
