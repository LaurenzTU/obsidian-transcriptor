# Transcriptor - Obsidian Plugin



A powerful transcription plugin for Obsidian, designed to bring the capabilities of OpenAI's Whisper API directly into your vault. Record new audio notes or transcribe existing audio/video files with ease.

Built for **Laurenzius**. Find the project at: [https://github.com/LaurenzTU/obsidian-transcriptor](https://github.com/LaurenzTU/obsidian-transcriptor)

---

## Features

-   **Direct Recording**: Instantly capture your thoughts with a built-in audio recorder.
-   **File Transcription**: Transcribe existing audio and video files from your vault.
-   **Powered by OpenAI**: Utilizes the official `whisper-1` model for high-quality transcriptions.
-   **Timestamp Support**: Optionally generate detailed timestamps for each audio segment.
-   **Customizable**: Configure the model, language, and initial prompts to improve accuracy.
-   **Flexible Output**: Insert transcriptions directly at your cursor or create new, organized notes.
-   **Full Control**: Manage audio file storage, note creation paths, and more through a detailed settings panel.
-   **Debug Mode**: Verbose logging available for easy troubleshooting.

## Installation & Configuration

### Manual Installation

1.  Download the `main.js`, `manifest.json`, and `LICENSE` files from the latest [release](https://github.com/LaurenzTU/obsidian-transcriptor/releases).
2.  In your Obsidian vault, navigate to `YourVault/.obsidian/plugins/`.
3.  Create a new folder named `obsidian-transcriptor`.
4.  Place the downloaded `main.js`, `manifest.json`, and `LICENSE` files inside this new folder.
5.  Reload Obsidian.
6.  Go to `Settings` -> `Community plugins`, find "Transcriptor", and enable it.

### Configuration

Before you can use the plugin, you **must** configure your OpenAI API key:

1.  Go to `Settings` -> `Community plugins` and open the settings for "Transcriptor".
2.  Enter your OpenAI API Key in the "OpenAI API Key" field.
3.  Customize other settings like language, output paths, and timestamp format to fit your workflow.

## For Developers

To contribute or build the plugin from the source:

1.  Clone the repository.
2.  Run `npm install` to install dependencies.
3.  Run `npm run dev` to start a development build that automatically updates on file changes.
4.  Run `npm run build` to create a production-ready build.

---

**License**: [GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007](https://www.gnu.org/licenses/gpl-3.0.html)