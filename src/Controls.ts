import Transcriptor from "main";
// --- CORRECTED: 'Notice' has been added to the import list ---
import { ButtonComponent, Modal, Notice } from "obsidian";
import { RecordingStatus } from "./StatusBar";

export class Controls extends Modal {
    private plugin: Transcriptor;
    private startButton: ButtonComponent;
    private pauseButton: ButtonComponent;
    private stopButton: ButtonComponent;
    private timerDisplay: HTMLElement;

    constructor(plugin: Transcriptor) {
        super(plugin.app);
        this.plugin = plugin;
        this.containerEl.addClass("recording-controls");

        this.timerDisplay = this.contentEl.createEl("div", { cls: "timer" });
        this.updateTimerDisplay();

        this.plugin.timer.setOnUpdate(() => {
            this.updateTimerDisplay();
        });

        const buttonGroupEl = this.contentEl.createEl("div", {
            cls: "button-group",
        });

        this.startButton = new ButtonComponent(buttonGroupEl)
            .setIcon("microphone")
            .setButtonText(" Record")
            .onClick(this.startRecording.bind(this));
        this.startButton.buttonEl.addClass("button-component");

        this.pauseButton = new ButtonComponent(buttonGroupEl)
            .setIcon("pause")
            .setButtonText(" Pause")
            .onClick(this.pauseRecording.bind(this));
        this.pauseButton.buttonEl.addClass("button-component");

        this.stopButton = new ButtonComponent(buttonGroupEl)
            .setIcon("square")
            .setButtonText(" Stop")
            .onClick(this.stopRecording.bind(this));
        this.stopButton.buttonEl.addClass("button-component");
        
        this.resetGUI();
    }

    onClose() {
        super.onClose();
        if (this.plugin.recorder.getRecordingState() !== 'inactive') {
            console.log("Recording stopped due to modal close.");
            this.plugin.recorder.stopRecording(); 
            this.plugin.timer.reset();
            this.plugin.statusBar.updateStatus(RecordingStatus.Idle);
        }
    }

    async startRecording() {
        this.plugin.statusBar.updateStatus(RecordingStatus.Recording);
        await this.plugin.recorder.startRecording();
        this.plugin.timer.start();
        this.resetGUI();
    }

    async pauseRecording() {
        await this.plugin.recorder.pauseRecording();
        const state = this.plugin.recorder.getRecordingState();
        this.plugin.statusBar.updateStatus(state === 'paused' ? RecordingStatus.Paused : RecordingStatus.Recording);
        this.plugin.timer.pause();
        this.resetGUI();
    }

    async stopRecording() {
        this.plugin.statusBar.updateStatus(RecordingStatus.Processing);
        const blob = await this.plugin.recorder.stopRecording();
        this.plugin.timer.reset();
        this.resetGUI();
        this.close();

        if (blob.size === 0) {
            new Notice("Recording was empty. Nothing to transcribe.");
            this.plugin.statusBar.updateStatus(RecordingStatus.Idle);
            return;
        }

        const extension = this.plugin.recorder.getMimeType()?.split('/')[1] || 'webm';
        const fileName = `recording-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`;

        await this.plugin.audioHandler.saveAudioFile(blob, fileName);
        await this.plugin.audioHandler.transcribeAudio(blob, fileName);

        this.plugin.statusBar.updateStatus(RecordingStatus.Idle);
    }

    updateTimerDisplay() {
        this.timerDisplay.textContent = this.plugin.timer.getFormattedTime();
    }

    resetGUI() {
        const recorderState = this.plugin.recorder.getRecordingState();

        this.startButton.setDisabled(recorderState === "recording" || recorderState === "paused");
        this.pauseButton.setDisabled(recorderState === "inactive");
        this.stopButton.setDisabled(recorderState === "inactive");
        this.pauseButton.setButtonText(recorderState === "paused" ? " Resume" : " Pause");
    }
}