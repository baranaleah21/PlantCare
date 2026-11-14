# PlantCare Expo (clickable demo)

This bundle contains a working Expo Router demo based on your PlantCare/Stitch login design and the functional screens requested.

## Screens included
- Login (`/login`) with email/password validation and show/hide password
- Sign up (`/signup`) with form validation
- Forgot password (`/forgot-password`) with demo confirmation
- Home dashboard (`/home`)
- My Plants (`/plants`) with add, mark-care-complete/undo, and remove
- Add Plant (`/add-plant`) with plant name, species, care frequency and next-care selection
- Care Calendar (`/calendar`) with tappable completion tasks
- Reminders (`/reminders`) with toggles
- Care History (`/history`)
- Settings (`/settings`) with navigation and sign out

## Install into your existing project
1. Make a backup of your existing `src` folder.
2. Copy this bundle's `src` folder into the root of your existing `PlantCare` project, merging/replacing the matching files.
3. From the project root in VS Code terminal, run:

```powershell
npx expo install expo-router react-native-safe-area-context react-native-screens expo-status-bar
```

4. Confirm your `package.json` has Expo Router configured. If your project was created with Expo Router, keep its existing configuration. The expected entry point is `expo-router/entry`.
5. Start the app:

```powershell
npx expo start
```

If port 8081 is occupied, type `y` to use the offered alternate port.

## Important limitations
This is a **local demo**, not production authentication. Any valid-looking email and password with at least 4 characters can sign in. Sign-up does not create a server account. Google and Apple buttons show a setup message because real OAuth credentials are required. Password reset shows a demo confirmation only. Plants and settings live in React state and reset when the app reloads. Reminder switches update the UI but do not schedule push notifications. Those features require persistent storage, backend/auth provider, and Expo Notifications setup.

## Main files
- `src/app/` contains routes/screens
- `src/context/PlantCareContext.tsx` holds shared demo plant and sign-in state
- `src/app/_layout.tsx` wraps routes in the context provider
