import * as SecureStore from "expo-secure-store";

// Thin async wrapper over expo-secure-store. Replaces the web app's
// localStorage for JWT + cached user. Keys mirror the web app.
export const TOKEN_KEY = "pulse_token";
export const USER_KEY = "pulse_user";
export const DEVICE_KEY = "pulse_device";

export const getItem = (key) => SecureStore.getItemAsync(key);
export const setItem = (key, value) => SecureStore.setItemAsync(key, value);
export const removeItem = (key) => SecureStore.deleteItemAsync(key);
