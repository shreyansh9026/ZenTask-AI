# 🚀 Changelog - ZenTask AI Bot

All notable changes to this project are documented in this file.

---

## [2.4.0] - 2026-04-10
### Added
- **AI Voice Support**: Integrated Groq Whisper-v3 for ultra-fast voice note transcription into tasks.
- **Smart Categorization**: Added an AI-engine that automatically tags tasks (e.g., #Work, #Personal) based on context.
- **Admin Safety Audit**: Added the `/safety` command to analyze channel sentiment and toxicity using Groq.
- **Collaborative Task Lists**: Added `/task shared-list` for server-wide team work tracking.
- **Premium Web Dashboard**: Built a modern analytics dashboard (Express.js) at [http://localhost:3000](http://localhost:3000).

---

## [2.0.0] - 2026-04-09
### Added
- **Native Slash Commands**: Migrated all features to native Discord (/) Slash Commands.
- **MongoDB Migration**: Switched storage from local JSON files to MongoDB Atlas for cloud scalability.
- **AI Vision Core**: Support for Llama 3.2 11B Vision for image analysis and OCR.
- **Smart OCR**: Added `/ocr-tasks` to extract tasks from physical photos and whiteboard images.
- **User Personalization**: Added `/settings` to customize timezones and preferred AI models.
- **Persistent Chat History**: AI now remembers the last 10 messages across bot restarts using MongoDB persistence.

---

## [1.0.0] - Legacy
### Changed
- Original prefix-based commands (!task, !note).
- Local JSON storage (`tasks.json`, `notes.json`).
- In-memory chat context (cleared on restart).

---
*Maintained by Shreyansh Tripathi*
