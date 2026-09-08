# MVP: Globe Trotter

## 1. Authoring Tools

The authoring interface enables content creators to build and manage modules, tutorials, and labs. All pages should follow the Figma designs found at [https://www.figma.com/design/tDfF7jfbzMnci0ZwAANFpI/Globe-Trotter?node-id=0-1&t=sp1klm8aAyNgpHGV-0](https://www.figma.com/design/tDfF7jfbzMnci0ZwAANFpI/Globe-Trotter?node-id=0-1&t=sp1klm8aAyNgpHGV-0).

### 1.1 All Modules Page

- Fetch modules from `GET /modules` (NestJS endpoint).
- Display paginated list with status badges (`Draft`/`Published`).
- "Create Module" button navigates to `/author/modules/new` (or similar).

**Technical Implementation:**
- React Server Component (Next.js) with client-side interactivity for delete/edit actions.
- Uses `@repo/ui` components for cards, badges, and buttons.

### 1.2 Create Module Page

- **Left:** Form for module-level details (`title`, `description`, `thumbnailUrl`, `isPublished` toggle).
- **Right:** Sequence list of tutorial/lab cards (in order). Cards display type badge, title, status, and action buttons (`Edit`, `Delete`). "Add Tutorial" and "Add Lab" buttons insert new items.
- Drag-and-drop reordering updates `orderIndex` automatically.
- "Save Module" button persists changes via `POST /modules` or `PUT /modules/:id`.

**Technical Implementation:**
- React client component with form state management (Zod for validation, React Hook Form and/or Zustand?).
- Drag-and-drop using `dnd-kit`, `react-beautiful-dnd` or another appropriate library.
- API calls to NestJS endpoints:
  - `POST /modules` → Create module.
  - `PUT /modules/:id` → Update module.
  - `DELETE /modules/:id` → Delete module.
  - `POST /modules/:id/tutorials` → Add tutorial.
  - `POST /modules/:id/labs` → Add lab.
  - `PUT /modules/:id/order` → Update orderIndex.

### 1.3 Create Tutorial Page

- Two-column layout (as per Figma).
- **Left:** Metadata editor (`title`, `description`, `estimatedDuration`, `isPublished`) + WYSIWYG editor for `content` (text, images, videos, embed map interactions).
- **Right:** Map Template Selector + live map preview + configuration controls for `initialState` (zoom, center, layers).
- "Save Tutorial" button persists via `POST /tutorials` or `PUT /tutorials/:id`.

**Technical Implementation:**
- WYSIWYG editor using TipTap.
- Map preview using `react-map-gl` with selected template.
- Map interaction insertion via custom toolbar button that inserts JSON blocks into the editor content.
- API endpoints:
  - `POST /tutorials` → Create tutorial.
  - `PUT /tutorials/:id` → Update tutorial.
  - `GET /map-templates` → Fetch available templates (from Issue 6).

### 1.4 Create Lab Page

- Two-column layout (as per Figma).
- **Left:** Metadata editor (`title`, `description`, `successMessage`, `failureMessage`, `allowedAttempts`, `isPublished`) + Goals Builder (dynamic form for multiple goals: type, description, expected, hint) + optional Hints Builder.
- **Right:** Map Template Selector + live map preview + configuration controls for `initialState`.
- "Save Lab" button persists via `POST /labs` or `PUT /labs/:id`.

**Technical Implementation:**
- Dynamic form builder for goals (add/remove goals, conditional fields based on `type`).
- Goals stored as JSON conforming to the lab's `goals` schema.
- API endpoints:
  - `POST /labs` → Create lab.
  - `PUT /labs/:id` → Update lab.

---

## 2. Student Experience

The student-facing interface provides a seamless learning journey through modules.

### 2.1 Home Page

- Hero section with headline, sub-headline, and call-to-action ("Browse Modules").
- Static content (no API calls required for MVP).
- Link to `/catalog` for module browsing.

**Technical Implementation:**
- Next.js Server Component (static gen or SSR).

### 2.2 Module Catalog Page

- Fetch **published** modules from `GET /modules?published=true`.
- Grid/list display with thumbnails, titles, descriptions.
- "Start Module" button navigates to `/modules/:id`.

**Technical Implementation:**
- Next.js Server Component with `fetch` or `react-query` for data fetching.
- Uses `@repo/ui` components for cards and buttons.

### 2.3 Module View Page

- Fetch module details + its tutorials/labs from `GET /modules/:id`.
- Linear sequence display with status indicators (`Locked`/`Unlocked`/`Completed`).
- Unlock logic: sequential by `orderIndex` (must complete previous item to unlock next).
- Status determined by `user_progress` table.

**Technical Implementation:**
- Next.js Server Component with client-side interactivity for status updates.
- Progress status fetched from `GET /user-progress?moduleId=:id`.
- "Start" button navigates to `/tutorials/:id` or `/labs/:id`.

### 2.4 Tutorial View Page

- Fetch tutorial content from `GET /tutorials/:id`.
- Scrollable content view with embedded map interactions.
- "Mark as Complete" button updates `user_progress` via `POST /user-progress`.

**Technical Implementation:**
- Renders `content` JSON from the tutorial.
- Map interactions rendered using `react-map-gl` and interaction components.
- API endpoints:
  - `GET /tutorials/:id` → Fetch tutorial content.
  - `POST /user-progress` → Update progress status.

### 2.5 Lab View Page

- Fetch lab details from `GET /labs/:id`.
- Goals checklist with status (Pending/Completed/Failed).
- Interactive map rendered with `initialState`.
- "Submit Lab" button sends submission to `POST /labs/:id/submit`.
- Evaluation engine compares submission against `goals.expected` and returns success/failure.
- Expandable hints section (if configured).
- Attempt counter (if `allowedAttempts` is set).

**Technical Implementation:**
- Submission payload: `{ labId, answers: { goalId: value } }`.
- Evaluation logic in NestJS:
  - `region_selection`: Check if clicked country ID matches expected.
  - `path_drawing`: Check if drawn path is within tolerance of expected.
  - `text_input`: Case-insensitive string match.
  - `multiple_choice`: Check if selected option matches correctIndex.
- API endpoints:
  - `GET /labs/:id` → Fetch lab details.
  - `POST /labs/:id/submit` → Submit lab and evaluate goals.
  - `POST /user-progress` → Update progress status.

---

## 3. Interactive Map System

The map system provides reusable templates and interaction components for tutorials and labs.

### 3.1 Map Templates (MVP)

| Template | Implementation | Configurable |
| :--- | :--- | :--- |
| **World Political Map (2D)** | MapLibre GL JS with `https://demotiles.maplibre.org/style.json` | `showBorders`, `showLabels`, `showCapitals` |
| **World Physical Map (2D)** | MapLibre GL JS with physical geography style | `showElevation`, `showRivers`, `showLabels` |
| **Satellite View (3D Globe)** | MapLibre GL JS with terrain/raster satellite tiles | `cameraAngle`, `tilt`, `pitch` |

**Technical Implementation:**
- Each template is a React component wrapping `react-map-gl`.
- Templates accept `initialState` prop (zoom, center, layers).
- Dynamic imports with `ssr: false` to prevent SSR issues?
- Template registry in `packages/ui/src/lib/mapTemplates.ts`.

### 3.2 Map Interaction Components

| Component | Purpose |
| :--- | :--- |
| `RegionSelection` | Click on a country/region |
| `PathDrawing` | Draw a polyline on the map |
| `PolygonDrawing` | Draw a shape on the map |
| `MapZoom` | Programmatically zoom to coordinates |
| `MapHighlight` | Highlight a region or point |

**Technical Implementation:**
- Built using `react-map-gl` and `mapbox-gl-draw` (or custom drawing logic) + maybe `react-map-gl-draw` for the Editor component.
- Shared interaction state using Zustand or React Context.
- Interaction data stored in lab `goals.expected` for validation.

### 3.3 Authoring Integration

- Map Template Selector in tutorial/lab authoring pages (Issue 6).
- Live preview with `initialState` configuration (zoom, center, layer toggles).
- Interaction components insertable into tutorial content or lab goals.

---

## 4. Backend API Endpoints

### Module Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/modules` | List all modules (filter by `published` query param) |
| `GET` | `/modules/:id` | Get module details + tutorials/labs |
| `POST` | `/modules` | Create a new module |
| `PUT` | `/modules/:id` | Update module details |
| `DELETE` | `/modules/:id` | Delete module |
| `PUT` | `/modules/:id/order` | Update tutorial/lab order |

### Tutorial Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/tutorials/:id` | Get tutorial content |
| `POST` | `/tutorials` | Create a new tutorial |
| `PUT` | `/tutorials/:id` | Update tutorial |
| `DELETE` | `/tutorials/:id` | Delete tutorial |

### Lab Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/labs/:id` | Get lab details |
| `POST` | `/labs` | Create a new lab |
| `PUT` | `/labs/:id` | Update lab |
| `DELETE` | `/labs/:id` | Delete lab |
| `POST` | `/labs/:id/submit` | Submit lab and evaluate goals |

### Progress Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/user-progress` | Get progress for a user (filter by `moduleId`, `tutorialId`, `labId`) |
| `POST` | `/user-progress` | Create or update progress |
| `GET` | `/user-progress/module/:moduleId` | Get all progress for a module |

---

## 5. Database Schema Summary

The database is managed by Drizzle ORM in `packages/database`.

| Table | Purpose |
| :--- | :--- |
| `users` | Authentication and user identity |
| `modules` | Top-level content containers |
| `tutorials` | Teaching content with embedded map interactions |
| `labs` | Standalone tasks with goals and hints |
| `user_progress` | Tracks user progress across modules, tutorials, and labs |
| `refreshTokens` | Stores refresh tokens that are currently in use |

**Key Constraints:**
- `UNIQUE (email)` on `users`.
- `UNIQUE (moduleId, orderIndex)` on `tutorials` and `labs`.
- `UNIQUE (userId, moduleId, tutorialId, labId)` on `user_progress`.
- `CHECK` constraint on `user_progress` ensuring only one of `tutorialId` or `labId` is populated.

---

## 6. Error Handling

- Single, reusable error page that handles all HTTP status codes and network errors (where appropriate).
- Global error boundary in Next.js (client-side) and custom error page (server-side).
- Background error logging.
- API error responses follow standard format:
  ```json
  { "statusCode": 404, "message": "Module not found", "timestamp": "2024-01-01T00:00:00Z" }
  ```

---

## Success Criteria (What "Done" Looks Like)

- Authors can create a module and add tutorials/labs to it.
- Authors can configure a map template for each tutorial/lab.
- Authors can write text content and insert map interactions.
- Authors can define goals and hints for labs.
- Students can view a catalog of published modules.
- Students can progress through tutorials/labs in sequence.
- Students can interact with maps to complete lab goals.
- Students can submit labs and see success/failure feedback.
- 2-3 polished modules are available for testing.
- Platform is deployable and passes basic status checks.
