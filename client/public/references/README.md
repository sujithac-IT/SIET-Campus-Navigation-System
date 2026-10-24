# SIET SmartNav — Visual Reference Assets Directory

This folder is reserved for the official photographic and satellite references for **Sri Shakthi Institute of Engineering and Technology (SIET)**, Coimbatore, Tamil Nadu, India.

---

## Required Reference Image Files

To display your exact uploaded campus photographs in the application, save your image files directly into this directory (`client/public/references/`) with the corresponding filenames:

| Filename | Campus Feature Description | Verified Geographic Coordinates | Source / Evidence |
| :--- | :--- | :--- | :--- |
| **`siet_entrance_gateway.jpg`** | SIET Grand Entrance Gateway & Arch | `11.040913° N, 77.077493° E` | Google Maps Link 1 / NH 544 intersection |
| **`siet_main_block_glass.jpg`** | Glass-Fronted Administrative Main Block | `11.039940° N, 77.074923° E` | OSM Way 240742620 (`building: office`) |
| **`siet_academic_building.jpg`** | Multi-Storey Academic Lecture Complex | `11.040404° N, 77.074018° E` | OSM Ways 1243485332-1243485338 (`levels: 5, height: 18m`) |
| **`siet_campus_satellite_internal_road.jpg`** | Campus Satellite Overview & Internal Avenues | `11.040350° N, 77.074850° E` | Esri World Imagery & OSM Ways 240742614, 240742619 |
| **`siet_basketball_court.jpg`** | FIBA Standard Synthetic Basketball Court | `11.039450° N, 77.073400° E` | Western Sports Arena, floodlit court |
| **`siet_handball_court.jpg`** | Official Collegiate Handball Court | `11.039150° N, 77.073350° E` | Western Sports Arena, adjacent to basketball pavilion |

---

## Technical Notes

1. **Automatic Fallback:** If any image file is not yet present on disk, the application automatically displays an informative SVG / category badge card with verified GPS coordinates and OpenStreetMap survey tags, ensuring zero broken image icons.
2. **Next.js Static Serving:** All files placed in this folder are immediately available at the route `/references/<filename>`.
3. **Map Popup Integration:** When clicking any verified building or facility on the Leaflet map, the information modal and bottom drawer automatically embed these visual references alongside room counts and accessibility tags.
