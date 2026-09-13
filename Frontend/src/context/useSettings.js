import {
  useSettingsContext,
} from "./SettingsContext";


// =========================================================
// CUSTOM SETTINGS HOOK
// =========================================================

export const useSettings =
  () => {

    return useSettingsContext();
  };