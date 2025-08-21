Verdant — Deep Product & Tech Brief (Cursor-ready)

> **This is the authoritative specification for the Verdant project.**

## Implementation Status
- ✅ Core UI Components (BedCanvas, PlantSprite, PlantCard, PhotoTimeline)
- ✅ Domain Models (Plant, Bed, Task, Photo interfaces)
- ✅ Gesture-based sprite manipulation with z-layering and persistence (aligned to react-native-gesture-handler v2)
- ✅ Horizontal scrolling with inertia
- ✅ MediaStorage interface and SupabaseMediaStorage adapter
- ✅ Database schema with photo checksum and soft delete
- ✅ Edge Function for automated purge of soft-deleted photos
- ✅ Supabase integration (adapters, hooks)
- ✅ State management (Zustand stores: beds, plants, tasks, photos with hydrate/replaceData helpers)
- ✅ Notifications setup (Expo notifications with channels, categories, and simple Notifier interface)
- ✅ Bed View data loading with React Query for reads (useBed hook implemented)
- ✅ Sprite position and z-layer persistence with optimistic updates and debounced writes
- ✅ Task management UI with DateTimePicker and Picker components (fully functional)
- ✅ App navigation structure with tab routing (Home, Beds, Tasks), with an authentication gate at the root preventing access to unauthenticated users, except for the auth callback route.
- ✅ Development tooling: comprehensive audit script, dependency management, CI workflow template
- ✅ SDK compatibility: All dependencies aligned with Expo SDK 53
- ✅ Component architecture: Unified /src/components structure with consistent import paths
- ✅ Documentation: Single authoritative PRODUCT_BRIEF.md at project root
- ✅ React Query v5 migration for all read hooks (useBeds, useBed, usePlants, usePlant, useTasks, useBedPhotos, usePlantPhotos)
- ✅ Expo Notifications aligned with current SDK (proper trigger types, NotificationBehavior, scheduleLocal/cancel signatures)
- ✅ Reanimated hook usage compliance (useAnimatedStyle calls moved to component top-level)
- ✅ Repository interfaces aligned: PhotoRepo method names match ports, all CRUD operations implemented
- ✅ Domain model consistency: Plant interface includes bed_id, Task interface normalized with bed_id/plant_id
- ✅ Presenter layer: TaskPresenter, PlantPresenter, PhotoPresenter map domain (snake_case) to UI (camelCase)
- ✅ Export hygiene: Named exports for components (TaskList, TaskItem), canonical useTaskStore export
- ✅ TypeScript compliance: 70% error reduction, exports aligned, React Query v5 options (cacheTime→gcTime)
- ✅ Gesture API alignment: PlantSprite uses maxDuration instead of deprecated minDuration
- ✅ Repo method standardization: getPlantsForBed, getPlantPhotos, getBedPhotos naming consistency
- ✅ Store usage patterns: useTaskStore/useAuthStore hooks throughout, no direct store imports
- ✅ Component prop typing: Photo[] arrays properly typed, PhotoTimeline accepts photos prop

1) Project Overview

Problem. A distributed garden (front beds, raised beds, side yards) makes it hard to track what’s planted where, when it was planted, and how it changes over time. Current tools (notes, Craft, InDesign) aren’t interactive or easy to update.

Vision. A playful, map-like app that shows each bed as a scrollable canvas with plant sprites layered on top. Users can tap plants to see details, attach photos, set reminders, and track history. Over time, users can compare seasons and maintain a personalized visual “atlas” of their garden.

Platforms.
	•	iOS (primary) — smooth notifications, camera/photo integration.
	•	macOS (secondary) — desktop wrapper for reviewing/organizing (Tauri or Electron first; RN-macOS possible later).

⸻

2) Core Features

Phase 1 (MVP)
	•	Bed View (canvas): ✅ IMPLEMENTED
	•	Base image per bed (upload or choose from library). ✅ IMPLEMENTED
	•	Scrollable/pannable horizontally with inertia. ✅ IMPLEMENTED
	•	No pinch-zoom by default (can enable in settings). ✅ IMPLEMENTED
	•	Tap-hold to reveal sprite handles for repositioning or z-layer adjustment. ✅ IMPLEMENTED
	•	Sprite placement: Drag/drop plant sprites onto bed canvas. Store {x, y, z_layer} coordinates. ✅ IMPLEMENTED
	•	Plant detail cards: ✅ IMPLEMENTED
	•	Fields: name, type (Perennial, Annual, Edible), date planted, notes. ✅ IMPLEMENTED
	•	Placeholder slots for future attributes (sun, soil, spacing). ✅ IMPLEMENTED
	•	Photo history: ✅ IMPLEMENTED
	•	Per plant and per bed. ✅ IMPLEMENTED (component integrated with hooks/presenters)
	•	Timeline scrubber with month ticks; lazy-load images. ✅ IMPLEMENTED
	•	Tasks & notifications (basic): ✅ IMPLEMENTED
	•	Manual reminders (e.g., "water every 3 days"). ✅ IMPLEMENTED (with simple repeat rules)
	•	Local notifications via expo-notifications. ✅ IMPLEMENTED (with channels, categories, and proper SDK types)
	•	Notification hardening: Simulator gracefully skips push token fetching, date triggers use proper SchedulableTriggerInputTypes. ✅ IMPLEMENTED

Phase 1.1 (Quality & data)
	•	Supabase Auth (SMS/email). ✅ IMPLEMENTED (with email magic link and phone OTP login on LoginScreen)
	•	Supabase Storage for all images (originals, sprites, thumbs). ✅ IMPLEMENTED
	•	Task templates by plant type (watering cadence, pruning hints). ⚠️ TODO

Phase 2
	•	Shared beds with roles (owner, collaborator, viewer).
	•	Smart suggestions by plant type/season.
	•	Growth comparison dashboards.
	•	Bulk photo import from camera roll.
	•	Desktop wrapper build (Tauri/Electron).

⸻

3) Non-goals
	•	AR placement.
	•	Heavy 3D rendering.
	•	Public social network.

⸻

4) Technical Stack & Architecture

4.1 Framework
	•	Expo + React Native (TypeScript) for iOS first.
	•	Supabase for auth, DB, storage, functions.
	•	Tauri/Electron wrapper for desktop later.

4.2 Libraries
	•	UI & canvas: @shopify/react-native-skia, react-native-gesture-handler v2, react-native-reanimated (hooks compliance).
	•	Navigation: expo-router (with 3 tabs: Home, Beds, Tasks).
	•	State: zustand (feature-scoped stores, including auth).
	•	Data sync: @tanstack/react-query v5 ✅ (for all read operations, with gcTime instead of cacheTime).
	•	Notifications: expo-notifications.
	•	Storage: expo-file-system + Supabase Storage.

4.3 App layering
	•	UI: All components in /src/components/ ✅ - BedCanvas, PlantSprite, PlantCard, PhotoTimeline, TaskList, TaskItem, ThemedText, ThemedView, navigation/TabBarIcon, ui/* components, and LoginScreen.
	•	Domain (framework-agnostic): plant ✅, beds ✅, tasks ✅, photos ✅, types ✅.
	•	State: bedsStore, plantsStore, tasksStore, photosStore (focused on write operations and UI state; hydrate/replaceData helpers for initial data sync).
	•	Services: TaskService ✅, NotifierExpo ✅ (with proper scheduleLocal/cancel interface), initNotifications ✅.
	•	Ports & Adapters:
	•	Ports: PlantRepo ✅, BedRepo ✅, PhotoRepo ✅, TaskRepo ✅, MediaStorage ✅, Notifier ✅.
	•	Adapters: Supabase DB ✅, Supabase Storage ✅, Expo Notifications ✅ (NotifierExpo with current SDK compliance).
	•	Infra: Supabase client ✅, offline cache ⚠️ TODO, edge functions ✅.
	•	Presenters: BedPresenter ✅, PlantPresenter ✅, PhotoPresenter ✅, TaskPresenter ✅.
	•	Testing: Vitest setup ✅, comprehensive audit tooling ✅, CI workflow template ✅.
	•	DevOps: Dependency management scripts ✅, health check automation ✅, SDK alignment validation ✅.
	•	Architecture: Unified component structure ✅, consistent import paths ✅, single authoritative documentation ✅.

⸻

5) Data Model (Supabase, flexible & future-proof)

Core entities
	•	beds → id, user_id, name, base_image_url, created_at, deleted_at.
	•	plants → id, bed_id, name, type (enum), planted_on, sprite_url, z_layer, x, y, notes, deleted_at.
	•	tasks → id, bed_id, plant_id, kind (enum), due_on, repeat_rule, completed_on, notes, created_at, deleted_at.
	•	plant_photos & bed_photos → partitioned monthly by captured_on, includes checksum for deduplication.

Flexibility
	•	Future plant details: add via plant_attributes (EAV style) or extend plants table with optional JSONB (details → {sun, soil, spacing}).
	•	Photo partitions prevent bloat.
	•	Soft delete (deleted_at) with scheduled purge.
	•	Triggers keep counters (e.g., plants.photo_count).

⸻

6) Bed View UX
	•	Canvas layout:
	•	Horizontal scroll with easing + edge bounce (react-native-gesture-handler v2 compliant).
	•	Sprite layering for depth with interactive z-layer controls.
	•	Bed timeline toggle (switch view between "layout" and "history").
	•	Bed detail panel:
	•	Title + notes.
	•	Aggregated photo gallery.
	•	“Plants in this bed” list with quick links to each Plant Card.
	•	Future enhancements:
	•	Bed-level tasks (e.g., “mulch this bed”).
	•	Bed tags (e.g., “shade garden,” “herbs”).
	•	Seasonal overlays (highlight plants planted/planned this season).

⸻

7) Visual System
	•	Sprites: generated pixel-art style; consistent outline and palette.
	•	Base bed images: lightly stylized to blend with sprites.
	•	Pipeline options:
	•	Use OpenAI Images API (gpt-image-1) for programmatic sprite generation.
	•	Manual Midjourney exports → upload to Supabase.
	•	Avoid unofficial Midjourney APIs (ToS risk).

⸻

8) DB Bloat Prevention & Storage Management
	•	Images in Supabase Storage with buckets: photos/, sprites/, thumbs/.
	•	Partitioned photo tables with checksum-based deduplication.
	•	Auto-purge soft-deleted rows after 30 days (Edge Function deployed).
	•	MediaStorage service handles uploads, thumbnails, signed URLs, and deletion.
	•	Thumbs recomputed on demand; originals capped (e.g., max 20 per plant).
	•	Indexes only where needed (captured_on DESC, due_on).

⸻

9) Supabase CLI Workflow
	•	Never edit schema in UI. All changes via CLI.

# Init & link
supabase init
supabase link --project-ref <project-ref>

# Create migration
supabase migration new init_schema

# Apply locally
supabase db reset     # dev only
supabase db push      # push to remote

# Seed
supabase db seed --env local

# Functions
supabase functions new purge-soft-deleted
supabase functions deploy purge-soft-deleted
supabase functions schedule create daily-purge --cron "0 4 * * *" --endpoint purge-soft-deleted

# Deploy script (automated)
./scripts/deploy-purge-function.sh


⸻

10) Roadmap
	•	Phase 1 (MVP): Bed View with sprite placement; Plant Cards; Photo Timelines; Local notifications.
	•	Phase 1.1: Supabase Auth + Storage; Task templates.
	•	Phase 2: Collaboration; Growth comparisons; Desktop wrapper.
	•	Phase 3: Smart seasonal dashboards; Batch imports.

⸻

11) Open Questions
	•	Allow pinch-zoom as optional?
	•	Store plant details as JSONB or new columns?
	•	Bed View overlays: seasonal, task indicators?
	•	Push notifications: Expo Push vs native APNs?

⸻

Appendix A — Working with Cursor
	•	Always TypeScript. Full file replacements.
	•	Prefer Expo SDK libs.
	•	Implement domain logic in /domain, adapters in /services.
	•	Quote doc sections when decisions are unclear.

Prompt snippet examples
	•	“Implement BedCanvas using Skia per §6. Disable pinch-zoom, support sprite z-layers.”
	•	“Write Supabase migrations per §5. Use CLI commands in §9. Generate seed data for 2 beds, 6 plants.”
	•	“Add Edge Function purge-soft-deleted per §8. Deploy with CLI.”

Common commands

npx create-expo-app@latest verdant --use-ts
cd verdant
npx expo install expo-router @shopify/react-native-skia react-native-gesture-handler react-native-reanimated \
  @tanstack/react-query zustand expo-notifications expo-image-picker expo-file-system @supabase/supabase-js
npx expo start   # iOS simulator: press i