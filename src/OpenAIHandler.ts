import axios, { AxiosError } from "axios";
import { TranscriptorSettings } from "./SettingsManager";
import { Notice } from "obsidian";

export class OpenAIHandler {
    private settings: TranscriptorSettings;

    constructor(settings: TranscriptorSettings) {
        this.settings = settings;
    }

    async transcribe(blob: Blob, fileName: string): Promise<any> {
        if (!this.settings.apiKey) {
            throw new Error("API key is missing. Please add your API key in the settings.");
        }

        const formData = new FormData();
        formData.append("file", blob, fileName);
        formData.append("model", this.settings.model);

        let promptForApi = this.settings.prompt;
        const langSetting = this.settings.language;

        if (langSetting === "auto_en_de") {
            const bilingualPrompt = "This audio may contain speech in English or German. ";
            promptForApi = bilingualPrompt + promptForApi;
        } else if (langSetting) {
            formData.append("language", langSetting);
        }

        if (promptForApi) {
            formData.append("prompt", promptForApi);
        }

        if (this.settings.timestamps) {
            formData.append("response_format", "verbose_json");
        }

        try {
            const response = await axios.post(
                "https://api.openai.com/v1/audio/transcriptions",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${this.settings.apiKey}`,
                    },
                }
            );

            if (this.settings.debugMode) {
                console.log("OpenAI API Response:", response.data);
            }

            return response.data;

        } catch (err) {
            const error = err as AxiosError;
            if (this.settings.debugMode) {
                console.error("Error transcribing audio:", error);
            }

            // --- UPDATED: Expanded Error Handling ---
            if (error.response) {
                // Handle specific API error codes
                if (error.response.status === 401) {
                    new Notice("OpenAI API Error: 401 - Unauthorized. Please check if your API key is correct and valid.", 15 * 1000);
                } else if (error.response.status === 429) {
                    const errorData = error.response.data as any;
                    let userMessage = "OpenAI API Error: 429 - Rate Limit or Quota Exceeded.\n\n";
                    if (errorData?.error?.message) {
                        userMessage += `Details: ${errorData.error.message}\n\n`;
                    }
                    userMessage += "Please check your OpenAI account billing, usage limits, or wait a moment and try again.";
                    new Notice(userMessage, 15 * 1000);
                } else {
                    // Generic message for other HTTP errors
                    new Notice(`API Error: ${error.response.status} - ${error.message}`);
                }
            } else if (error.request) {
                // Handle network errors (no response received)
                new Notice("Network Error: Could not connect to OpenAI API. Please check your internet connection.");
            } else {
                // Handle other unexpected errors
                new Notice(`An unexpected error occurred: ${error.message}`);
            }
            
            throw error;
        }
    }
}