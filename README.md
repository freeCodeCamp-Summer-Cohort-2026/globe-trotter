# Globe Trotter

Globe Trotter is a platform for teaching any general geography topic (starting with world geography - countries, capitals, flags) through short two-minute tutorials and longer open-ended labs. It's a general-purpose teaching engine, not a fixed geography curriculum.

Learners interact with a live map and other visual/spatial elements directly in the browser, and use the same to improve their knowledge of world geography.


## Tech Stack

**Frontend**: TypeScript + React + Next.js + Tailwind CSS

**Backend** - TypeScript + Nest.js

**Database** - PostgreSQL + Drizzle

**Interactive map** - React-map-gl for abstracted geography, React leaflet for landmarks, React simple maps for basic positions, Vis. GL for 3D maps

**Auth**: JWT

**Tests**: Jest


## How to get started

You may launch the app on your browser after setting it up locally or using Docker Compose. Once launched, you may use the app as a content creator or as a user. Depending on your chosen role, you will need to register and/or login to the app so that your content and/or your learning history may be saved.


## File Structure

```
globetrotter/
├── apps/            
|    └── api/
|    |   ├── src/       app.controller.ts, app.module.ts, app.service.ts, main.ts      
|    |   |── test/      app.e2e-spec.ts, jest-e2e.json
|    |── web/         
│       ├── app/        Layout, Frontend
│       └── page.js     
├── packages/
     |── config/
        |── eslint/     Prettier
        |── jest/       
          ├── src/  
        |── tailwind/   Tailwind CSS
        |── typescript/
     |── ui/
        ├── src/
```