# Recipe App (Hands-On Test)

A Recipe App built with React Native (Expo) and TypeScript.  
Includes recipe listing, filtering by recipe types (local JSON), full CRUD, and local persistence.

---

## Features

Core

- Load recipe types from local JSON (`recipetypes.json`) into Picker/Spinner
- Recipe listing with filtering by recipe type
- Add recipe (type, image, ingredients and steps)
- Recipe detail page (display title, type, image, ingredients and steps)
- Update recipe (all fields editable)
- Delete recipe
- Persist data across app restart using AsyncStorage

Extra Enhancements

- Swipe-to-delete action on recipe list
- Bottom Sheet Modal for actions
- Action modal (confirmation / quick actions)
- Toast messages for success/error feedback

---

## Architecture / Structure

- `screens/`  
  UI screens (Listing / Add / Detail)
- `context/`  
  App-level state management using React Context + Hooks
- `services/`  
  Storage layer abstraction (AsyncStorage read/write)
- `assets/data/recipetypes.json`  
  Local recipe types source file
- Sample recipes are pre-populated and matched to the recipe type keys

State Management & Lifecycle

- `useEffect` is used to load persisted data on app start
- Context provider exposes recipes state + CRUD methods to screens
- Storage is updated after create/update/delete to ensure persistence

---

## Run the App (Android & iOS)

Requirements:

- Node.js installed
- Expo CLI (optional, can run via npx)
- Expo Go app installed on your phone (Android & iOS)

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- QR Code to scan in physical device (Android & iOS) via Expo Go
- Android Emulator
- iOS Simulator
