import { App, PluginSettingTab, Setting } from "obsidian";
import Transcriptor from "main";
import { SettingsManager } from "./SettingsManager";

export class TranscriptorSettingsTab extends PluginSettingTab {
    private plugin: Transcriptor;
    private settingsManager: SettingsManager;

    constructor(app: App, plugin: Transcriptor) {
        super(app, plugin);
        this.plugin = plugin;
        this.settingsManager = plugin.settingsManager;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl("h2", { text: "Transcriptor Settings" });

        // --- API Settings ---
        new Setting(containerEl).setName("API Configuration").setHeading();
        this.createApiKeySetting(containerEl);
        this.createModelSetting(containerEl);

        // --- Transcription Settings ---
        new Setting(containerEl).setName("Transcription").setHeading();
        this.createLanguageSetting(containerEl);
        this.createPromptSetting(containerEl);
        
        // --- Timestamp Settings ---
        new Setting(containerEl).setName("Timestamps").setHeading();
        this.createTimestampsToggleSetting(containerEl);
        this.createTimestampFormatSetting(containerEl);
        
        // --- File and Path Settings ---
        new Setting(containerEl).setName("File & Path Management").setHeading();
        this.createSaveAudioFileToggleSetting(containerEl);
        this.createSaveAudioFilePathSetting(containerEl);
        this.createNewFileToggleSetting(containerEl);
        this.createNewFilePathSetting(containerEl);
        
        // --- Advanced Settings ---
        new Setting(containerEl).setName("Advanced").setHeading();
        this.createDebugModeToggleSetting(containerEl);
    }

    private createApiKeySetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("OpenAI API Key")
            .setDesc("Enter your OpenAI API key. You can find it on the OpenAI website.")
            .addText(text => text
                .setPlaceholder("sk-...xxxx")
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value) => {
                    this.plugin.settings.apiKey = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createModelSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Model")
            .setDesc("Specify the Whisper model to use.")
            .addText(text => text
                .setPlaceholder("whisper-1")
                .setValue(this.plugin.settings.model)
                .onChange(async (value) => {
                    this.plugin.settings.model = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createLanguageSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Language")
            .setDesc("Select the transcription language or a constrained auto-detect option.")
            .addDropdown(dropdown => dropdown
                .addOption("", "Auto-Detect (General)")
                .addOption("auto_en_de", "Auto-Detect (English & German)")
                .addOption("en", "English")
                .addOption("de", "German")
                .addOption("fr", "French")
                .addOption("es", "Spanish")
                .addOption("it", "Italian")
                .setValue(this.plugin.settings.language)
                .onChange(async (value) => {
                    this.plugin.settings.language = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createPromptSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Prompt (Optional)")
            .setDesc("A prompt to improve accuracy for specific words or styles.")
            .addTextArea(text => text
                .setPlaceholder("Example: ZyntriQix, ObsidiaNow, etc.")
                .setValue(this.plugin.settings.prompt)
                .onChange(async (value) => {
                    this.plugin.settings.prompt = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createTimestampsToggleSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Enable timestamps")
            .setDesc("Receive a verbose JSON response with timestamps for each segment.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.timestamps)
                .onChange(async (value) => {
                    this.plugin.settings.timestamps = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                    this.display();
                }));
    }

    private createTimestampFormatSetting(containerEl: HTMLElement): void {
        if (!this.plugin.settings.timestamps) return;
        new Setting(containerEl)
            .setName("Timestamp Format")
            .setDesc("Set the format for timestamps (e.g., HH:mm:ss.SSS).")
            .addText(text => text
                .setPlaceholder("HH:mm:ss")
                .setValue(this.plugin.settings.timestampFormat)
                .onChange(async (value) => {
                    this.plugin.settings.timestampFormat = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createSaveAudioFileToggleSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Save recording")
            .setDesc("Save the audio file after recording.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.saveAudioFile)
                .onChange(async (value) => {
                    this.plugin.settings.saveAudioFile = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                    this.display();
                }));
    }
    
    private createSaveAudioFilePathSetting(containerEl: HTMLElement): void {
        if (!this.plugin.settings.saveAudioFile) return;
        new Setting(containerEl)
            .setName("Recordings folder")
            .setDesc("Path where recorded audio files will be saved.")
            .addText(text => text
                .setPlaceholder("recordings")
                .setValue(this.plugin.settings.saveAudioFilePath)
                .onChange(async (value) => {
                    this.plugin.settings.saveAudioFilePath = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createNewFileToggleSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Create new file for transcription")
            .setDesc("ON: Create a new note. OFF: Insert at cursor.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.createNewFileAfterRecording)
                .onChange(async (value) => {
                    this.plugin.settings.createNewFileAfterRecording = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                    this.display();
                }));
    }

    private createNewFilePathSetting(containerEl: HTMLElement): void {
        if (!this.plugin.settings.createNewFileAfterRecording) return;
        new Setting(containerEl)
            .setName("Transcriptions folder")
            .setDesc("Path where new transcription notes will be created.")
            .addText(text => text
                .setPlaceholder("transcripts")
                .setValue(this.plugin.settings.createNewFileAfterRecordingPath)
                .onChange(async (value) => {
                    this.plugin.settings.createNewFileAfterRecordingPath = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }

    private createDebugModeToggleSetting(containerEl: HTMLElement): void {
        new Setting(containerEl)
            .setName("Debug Mode")
            .setDesc("Enable verbose logging to the developer console for troubleshooting.")
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.debugMode)
                .onChange(async (value) => {
                    this.plugin.settings.debugMode = value;
                    await this.settingsManager.saveSettings(this.plugin.settings);
                }));
    }
}