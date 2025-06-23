/*
 * Transcriptor - Obsidian Plugin
 * Copyright (C) 2025 Laurenzius
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { Plugin, TFile } from 'obsidian';
import { TranscriptorSettings, SettingsManager } from './src/SettingsManager';
import { TranscriptorSettingsTab } from './src/SettingsTab';
import { StatusBar } from './src/StatusBar';
import { NativeAudioRecorder, AudioRecorder } from './src/AudioRecorder';
import { Controls } from './src/Controls';
import { Timer } from './src/Timer';
import { AudioHandler } from './src/AudioHandler';

export default class Transcriptor extends Plugin {
    settings: TranscriptorSettings;
    settingsManager: SettingsManager;
    statusBar: StatusBar;
    recorder: AudioRecorder;
    timer: Timer;
    audioHandler: AudioHandler;

    // Supported file extensions for transcription
    private static readonly SUPPORTED_EXTENSIONS = [
        "mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm", "ogg", "flac", "aac", "amr", "aiff", "mov", "avi", "wmv", "flv", "mpg", "mkv"
    ];

    async onload() {
        console.log('Loading Transcriptor plugin');
        this.settingsManager = new SettingsManager(this);
        this.settings = await this.settingsManager.loadSettings();

        this.recorder = new NativeAudioRecorder();
        this.timer = new Timer();
        this.audioHandler = new AudioHandler(this.app, this.settings);

        this.statusBar = new StatusBar(this);

        this.addRibbonIcon('microphone', 'Start Recording', () => {
            new Controls(this).open();
        });

        this.addCommand({
            id: 'start-recording',
            name: 'Start Recording',
            callback: () => {
                new Controls(this).open();
            }
        });
        
        this.addCommand({
            id: 'transcribe-file',
            name: 'Transcribe selected file',
            checkCallback: (checking: boolean) => {
                const file = this.app.workspace.getActiveFile();
                if (file && Transcriptor.SUPPORTED_EXTENSIONS.includes(file.extension.toLowerCase())) {
                    if (!checking) {
                        this.audioHandler.processFile(file);
                    }
                    return true;
                }
                return false;
            }
        });

        this.registerEvent(
            this.app.workspace.on("file-menu", (menu, file) => {
                if (file instanceof TFile && Transcriptor.SUPPORTED_EXTENSIONS.includes(file.extension.toLowerCase())) {
                    menu.addItem((item) => {
                        item
                            .setTitle("Transcribe File")
                            .setIcon("microphone")
                            .onClick(() => {
                                this.audioHandler.processFile(file as TFile);
                            });
                    });
                }
            })
        );

        this.addSettingTab(new TranscriptorSettingsTab(this.app, this));
    }

    onunload() {
        console.log('Unloading Transcriptor plugin');
        this.statusBar.remove();
    }
}