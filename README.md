# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

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

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Supabase Setup

1.  **Environment Variables**: Create a `.env` file in the project root with your Supabase project URL and anon key:
    ```
    EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

2.  **Database Migrations**: Apply the Supabase schema migrations:
    ```bash
    supabase db push
    ```

3.  **Seed Data (Optional)**: Populate your database with seed data for development:
    ```bash
    supabase db seed
    ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Dependency Alignment & Audit

### Health Check Commands

Run these commands to ensure your development environment is properly configured:

```bash
# Quick health check - runs expo-doctor and dependency version check
npm run doctor

# Comprehensive audit - full project analysis including tests and linting
npm run audit

# Clear all caches if you encounter bundling issues
npm run start:clear
```

### Common Dependency Issues

#### DateTimePicker Resolution Error

If you see `Unable to resolve "@react-native-community/datetimepicker"`:

1. **Install via Expo** (ensures SDK compatibility):
   ```bash
   npx expo install @react-native-community/datetimepicker
   ```

2. **Clear caches**:
   ```bash
   npm run start:clear
   ```

3. **For development builds** (iOS only):
   ```bash
   npx pod-install
   ```

#### General Dependency Mismatches

- **Check for incompatible versions**: `npx expo install --check`
- **Auto-fix compatible versions**: `npx expo install --fix`
- **Verify configuration**: `npx expo config --type public`

### When to Use Each Command

- **`npm run doctor`**: Before starting development, after dependency changes
- **`npm run audit`**: Before commits, when troubleshooting issues, weekly health checks
- **`npm run start:clear`**: When Metro bundler has stale cache, after major dependency changes
- **`npm run typecheck`**: Before commits, to catch TypeScript errors early

## Workflow & Typecheck

**Expo Managed Workflow**: This project uses Expo Managed workflow. If native code is needed in the future, run `npx expo prebuild` to migrate to a development build workflow.

**Test Isolation**: TypeScript compilation and linting are configured to exclude test files for faster development:

- **App typecheck**: `npm run typecheck` (excludes `src/tests/` and `supabase/functions/`)
- **Test typecheck**: `npm run typecheck:test` (typechecks tests only)

This prevents test files from interfering with the main app compilation while keeping tests intact for future development.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
