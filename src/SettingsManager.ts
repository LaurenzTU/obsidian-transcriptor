import { Plugin } from "obsidian";

export interface TranscriptorSettings {
    apiKey: string;
    model: string;
    language: string;
    prompt: string;
    saveAudioFile: boolean;
    saveAudioFilePath: string;
    createNewFileAfterRecording: boolean;
    createNewFileAfterRecordingPath: string;
    timestamps: boolean;
    timestampFormat: string;
    debugMode: boolean;
}

export const DEFAULT_SETTINGS: TranscriptorSettings = {
    apiKey: "",
    model: "whisper-1",
    language: "en",
    prompt: "",
    saveAudioFile: true,
    saveAudioFilePath: "recordings",
    createNewFileAfterRecording: true,
    createNewFileAfterRecordingPath: "transcripts",
    timestamps: false,
    timestampFormat: "HH:mm:ss",
    debugMode: false,
};

export class SettingsManager {
    private plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    async loadSettings(): Promise<TranscriptorSettings> {
        return Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.plugin.loadData()
        );
    }

    async saveSettings(settings: TranscriptorSettings): Promise<void> {
        await this.plugin.saveData(settings);
    }
}