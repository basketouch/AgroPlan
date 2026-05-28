# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AgroFit** is an interactive map-based platform for generating optimal agricultural layout distributions. Users draw a parcel boundary, mark water infrastructure (well), and the system instantly generates a planting grid with density calculations and material estimates.

**MVP Scope**: Instant geometric layout generation without 3D topography.

## Stack & Setup

**Frontend**: React 18 + Vite (fast HMR dev server)
**Maps**: Google Maps JavaScript API with Drawing Library + Geometry Library
**Spatial Calculations**: Turf.js (geospatial analysis in the browser)
**Backend** (optional MVP): Firebase or Supabase for user projects/auth

### Common Commands

```bash
# Install dependencies
npm install

# Start dev server (opens browser at localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Setup Google Maps API

1. Get API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable: Maps JavaScript API, Drawing Library, Geometry Library
3. Copy `.env.example` to `.env.local` and add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```
4. Restart dev server

## Architecture

### File Structure

```
src/
├── components/
│   ├── MapContainer.jsx       # Google Maps view + drawing tools
│   ├── ControlPanel.jsx       # Settings: search, config, actions
│   ├── MetricsPanel.jsx       # Live results display
│   └── *.css                  # Component styles
├── utils/
│   └── geometry.js            # Core grid generation algorithm
├── App.jsx                    # Main app state + orchestration
├── main.jsx                   # React entry point
└── index.css                  # Global styles
```

### Data Flow (MVP User Journey)

1. **Search** → User enters municipality/coords → map centers
2. **Draw Parcel** → User clicks polygon vertices → closes shape
3. **Mark Well** → User drags marker → sets water point
4. **Configure** → User sets frame (7×7m), setback (5m)
5. **Generate** (The "Wow" moment) → System runs geometry algorithm instantly
6. **View Results** → Grid rendered on map + metrics panel populated

### Core Algorithm (src/utils/geometry.js)

**Function**: `generatePlantingGrid(parcelaCoords, pozoCord, config)`

**Steps** (Turf.js operations):

1. **Input validation**: Parcel polygon, well point, planting frame (m×m), setback distance
2. **Create main polygon**: From user-drawn coordinates
3. **Apply negative buffer** (setback): Shrink polygon inward by `config.retranqueo` meters
4. **Well exclusion zone**: Create circular buffer (5m radius) around well point
5. **Generate infinite grid**: Create point grid based on frame spacing + polygon orientation
6. **Clip to valid area**: Keep only points inside buffered parcel AND outside well buffer
7. **Calculate metrics**:
   - Area (hectares)
   - Plant count (point count)
   - Density (plants/ha)
   - Estimated pipeline length (rows + main line)
8. **Return**: Array of valid point coords + metrics object

**Key**: All calculations happen in the browser (client-side) for instant feedback. No server round-trips during generation.

### Component Responsibilities

**MapContainer**:
- Initialize Google Map + satellite view
- Handle drawing tool interactions (polygon + marker)
- Render parcel outline, well marker, grid points dynamically
- Manage map state (center, zoom)

**ControlPanel**:
- Search input → geocoding → center map
- Status indicators (parcel drawn? well placed?)
- Numeric inputs: marco horizontal/vertical, setback distance
- Preset buttons (7×7, 6×6, 5×5)
- Action buttons: Generate Layout, Download PDF, Export Data

**MetricsPanel**:
- Floats bottom-right of map
- Shows: total area, plant count, density, pipeline estimate, frame used
- Only visible after generation
- Updates in real-time as config changes

**App.jsx**:
- Holds shared state: `parcela`, `pozo`, `config`, `grid`, `metricas`
- Orchestrates: when user changes config → regenerate grid → update metrics
- Passes state down + callbacks up (lifting state)

### Geometry.js Details

**Main export**: `generatePlantingGrid()`
- Takes parcel coords (lat/lng array), well coords, config object
- Uses Turf.js for all spatial ops
- Returns: `{ points: Feature[], metricas: {} }`

**Supporting functions**:
- `validatePolygon()` — Check coords are valid (≥3 points, closed ring)
- `calculateArea()` — Get parcel area in hectares

**TODO (incomplete MVP)**: 
- Pipeline length calculation is approximate; refine for complex row patterns
- Angle alignment (orient grid to longest polygon side) — currently uses bbox
- Integrate Google Geocoding API for search

## Development Workflow

### Starting Fresh

1. `npm install` — Install Turf.js, Google Maps API wrapper, Vite
2. Copy `.env.example` → `.env.local`, add Google API key
3. `npm run dev` — Start server, opens browser
4. Check console for warnings (missing API key, missing Google Maps script)

### Iteration Loop

1. **Map integration**: Implement MapContainer (Google Maps init, drawing handlers)
2. **Geometry**: Wire ControlPanel inputs → call `generatePlantingGrid()` → render points
3. **Metrics**: Populate MetricsPanel from generation results
4. **Polish**: Styling, error handling, accessibility
5. **Export**: PDF/PNG download, CSV data export

### Testing the Algorithm

- Use browser DevTools console to call `generatePlantingGrid()` directly
- Inject test parcela + pozo coords
- Inspect returned grid + metricas
- Example parcel (Madrid region, ~1 ha):
  ```js
  const testParcela = [
    [-3.7, 40.41], [-3.69, 40.41], [-3.69, 40.42], [-3.7, 40.42], [-3.7, 40.41]
  ]
  ```

## Design Notes

- **Client-side first**: No backend needed for MVP. All spatial math runs in browser.
- **Turf.js is critical**: Handles buffer operations, point-in-polygon, grid generation. Don't reinvent these.
- **Google Maps Drawing Library**: Provides free polygon/marker tools (vs building from scratch).
- **Instant feedback**: Each config change regenerates grid immediately → users see "wow" moment.
- **Metrics drive engagement**: Show plant count + material estimate prominently.

## Known Limitations / TODOs

- Pipeline calculation is a rough approximation (not optimized for least-length irrigation)
- Grid angle doesn't yet align to polygon orientation
- No terrain/slope data (MVP scope)
- No historical project save (would need backend + auth)
- PDF export uses screenshot for MVP (not vector export)

## Future Enhancements (Post-MVP)

- Backend: Firebase/Supabase for user accounts + project storage
- 3D visualization of terrain + irrigation
- Multi-polygon support (multiple parcels)
- Turfing suggestions based on regional agronomic data
- API export to QGIS/GIS systems
