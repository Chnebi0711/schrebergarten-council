export type Lang = "en" | "de";

export const translations = {
  en: {
    // Header
    muteTitle:          "Mute voices",
    unmuteTitle:        "Unmute voices",
    changeKey:          "Change key",
    stopBtn:            "■ Stop",

    // Selection page
    tagline:            "Ask the garden. Hear every voice.",
    circleHint:         "Select a council member to include or exclude them.",
    questionLabel:      "Your question for the council",
    questionPlaceholder:"What should I plant near the compost heap?",
    conveneBtn:         "Convene the council",

    // Deliberation — speech card
    speakingIndicator:  "speaking…",
    figTreeStirs:       "The Fig Tree stirs…",
    figTreeConsiders:   "The Fig Tree considers the council's words…",
    gatheringThoughts:  "Gathering thoughts…",

    // Deliberation — voices list
    voicesHeard:        "Voices heard",

    // Synthesis card
    figTree:            "Fig Tree",
    synthesisSubtitle:  "Synthesis · The garden as a whole",
    saveBtn:            "↓ Save",

    // Action buttons
    newQuestion:        "← New question",
    downloadSession:    "↓ Download session",

    // Downloaded markdown
    mdTitle:            "Schrebergarten Council Session",
    mdQuestion:         "Question",
    mdOpening:          "Opening",
    mdVoices:           "Council Voices",
    mdSynthesis:        "Fig Tree Synthesis",
  },

  de: {
    // Header
    muteTitle:          "Stimmen stummschalten",
    unmuteTitle:        "Stimmen einschalten",
    changeKey:          "Schlüssel ändern",
    stopBtn:            "■ Stopp",

    // Selection page
    tagline:            "Frag den Garten. Höre jede Stimme.",
    circleHint:         "Wähle ein Ratsmitglied aus, um es ein- oder auszuschließen.",
    questionLabel:      "Deine Frage an den Rat",
    questionPlaceholder:"Was soll ich in der Nähe des Komposthaufens pflanzen?",
    conveneBtn:         "Den Rat einberufen",

    // Deliberation — speech card
    speakingIndicator:  "spricht…",
    figTreeStirs:       "Der Feigenbaum regt sich…",
    figTreeConsiders:   "Der Feigenbaum erwägt die Worte des Rates…",
    gatheringThoughts:  "Gedanken sammeln…",

    // Deliberation — voices list
    voicesHeard:        "Gehörte Stimmen",

    // Synthesis card
    figTree:            "Feigenbaum",
    synthesisSubtitle:  "Synthese · Der Garten als Ganzes",
    saveBtn:            "↓ Speichern",

    // Action buttons
    newQuestion:        "← Neue Frage",
    downloadSession:    "↓ Sitzung herunterladen",

    // Downloaded markdown
    mdTitle:            "Schrebergarten-Rats-Sitzung",
    mdQuestion:         "Frage",
    mdOpening:          "Eröffnung",
    mdVoices:           "Ratsstimmen",
    mdSynthesis:        "Feigenbaum-Synthese",
  },
} as const;

export type T = typeof translations.en;
