import GlobalSettingsInputs2026 from "./2026";

/**
 * Per-year settings committed to `localStorage` and therefore accessible across the app.
 * This is the only component in the project set up like this, but quite frankly,
 * they should all look more like this... transforming GAME_YEAR strings in `imports` is 
 * cool and all, but it led to a lot of pitfalls
 */
const GlobalSettingsInputs = {
    2026: GlobalSettingsInputs2026,
};

export default GlobalSettingsInputs;