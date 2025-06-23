import { Plugin } from "obsidian";

export enum RecordingStatus {
    Idle = "idle",
    Recording = "recording",
    Paused = "paused",
    Processing = "processing",
}

export class StatusBar {
    plugin: Plugin;
    statusBarItem: HTMLElement;
    status: RecordingStatus = RecordingStatus.Idle;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.statusBarItem = this.plugin.addStatusBarItem();
        this.updateStatusBarItem();
    }

    updateStatus(status: RecordingStatus) {
        this.status = status;
        this.updateStatusBarItem();
    }

    updateStatusBarItem() {
        switch (this.status) {
            case RecordingStatus.Recording:
                this.statusBarItem.setText("Recording...");
                this.statusBarItem.style.color = "red";
                break;
            case RecordingStatus.Paused:
                this.statusBarItem.setText("Paused");
                this.statusBarItem.style.color = "yellow";
                break;
            case RecordingStatus.Processing:
                this.statusBarItem.setText("Processing...");
                this.statusBarItem.style.color = "orange";
                break;
            case RecordingStatus.Idle:
            default:
                this.statusBarItem.setText("Transcriptor Idle");
                this.statusBarItem.style.color = "green";
                break;
        }
    }

    remove() {
        this.statusBarItem.remove();
    }
}