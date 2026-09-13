import {
  createContext,
  useContext,
} from "react";

const SettingsContext =
  createContext(null);


// =========================================================
// SETTINGS CONTEXT
// =========================================================

export const useSettingsContext =
  () => {

    const context =
      useContext(
        SettingsContext
      );

    if (!context) {

      throw new Error(
        "useSettingsContext must be used inside SettingsProvider"
      );
    }

    return context;
  };


export default SettingsContext;