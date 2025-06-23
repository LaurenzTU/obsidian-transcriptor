import { App, Notice, TFile, MarkdownView } from "obsidian";
import { TranscriptorSettings } from "./SettingsManager";
import { OpenAIHandler } from "./OpenAIHandler";
import { formatTimestamp, getBaseFileName } from "./Utils";

export class AudioHandler {
    private app: App;
    private settings: TranscriptorSettings;
    private openAIHandler: OpenAIHandler;

    constructor(app: App, settings: TranscriptorSettings) {
        this.app = app;
        this.settings = settings;
        this.openAIHandler = new OpenAIHandler(settings);
    }

    async transcribeAudio(blob: Blob, sourceFileName: string) {
        try {
            if (blob.size > 25 * 1024 * 1024) {
                new Notice("Error: File size exceeds the 25 MB limit for the OpenAI API.");
                return;
            }

            const transcriptionResult = await this.openAIHandler.transcribe(blob, sourceFileName);
            let content = transcriptionResult.text;

            if (this.settings.timestamps && transcriptionResult.segments) {
                content = transcriptionResult.segments.map((segment: any) => {
                    const start = formatTimestamp(segment.start, this.settings.timestampFormat);
                    const end = formatTimestamp(segment.end, this.settings.timestampFormat);
                    return `[${start} --> ${end}] ${segment.text.trim()}`;
                }).join("\n");
            }

            await this.handleTranscriptionOutput(content, sourceFileName);
            new Notice("Transcription successful.");
        } catch (error) {
            // Error notice is already handled gracefully inside OpenAIHandler
            // This catch block prevents the error from propagating further unnecessarily
        }
    }

    private async handleTranscriptionOutput(text: string, sourceFileName: string) {
        const shouldCreateNewFile = this.settings.createNewFileAfterRecording;

        if (shouldCreateNewFile) {
            // --- UPDATED: Added try...catch for file system operations ---
            try {
                const baseFileName = getBaseFileName(sourceFileName);
                const uuid = crypto.randomUUID();
                const uniqueFileName = `${baseFileName}-${uuid}`;
                const newNotePath = `${this.settings.createNewFileAfterRecordingPath || 'transcripts'}/${uniqueFileName}.md`;
                
                const directory = newNotePath.substring(0, newNotePath.lastIndexOf("/"));
                if (directory && !await this.app.vault.adapter.exists(directory)) {
                    await this.app.vault.createFolder(directory);
                }

                await this.app.vault.create(newNotePath, text);
                await this.app.workspace.openLinkText(newNotePath, "", true);
            } catch (fsError) {
                new Notice("Transcription successful, but failed to create the new note. Please check folder permissions and settings.", 10 * 1000);
                console.error("Failed to create transcription note:", fsError);
            }
        } else {
            const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                const editor = activeView.editor;
                editor.replaceSelection(text);
            } else {
                new Notice("No active editor. Please open a note to insert the transcription.");
            }
        }
    }

    public async saveAudioFile(blob: Blob, fileName: string): Promise<void> {
        if (!this.settings.saveAudioFile) return;

        const folder = this.settings.saveAudioFilePath || 'recordings';
        if (!await this.app.vault.adapter.exists(folder)) {
            await this.app.vault.createFolder(folder);
        }

        const audioFilePath = `${folder}/${fileName}`;

        try {
            const arrayBuffer = await blob.arrayBuffer();
            await this.app.vault.adapter.writeBinary(audioFilePath, new Uint8Array(arrayBuffer));
            if (this.settings.debugMode) {
                new Notice(`Audio saved to ${audioFilePath}`);
            }
        } catch (err) {
            console.error("Error saving audio file:", err);
            new Notice("Error saving audio file: " + err.message);
        }
    }

    public async processFile(file: TFile) {
        const arrayBuffer = await this.app.vault.readBinary(file);
        const blob = new Blob([arrayBuffer], { type: file.extension });
        await this.transcribeAudio(blob, file.name);
    }
}