# Centri website

Static site — no build step. Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Adding your photos and videos

Drop files into `assets/` with these names. Until a file exists, the page shows a labelled grey placeholder in that spot.

| Spot on the page                       | File                                | Shape         |
|----------------------------------------|-------------------------------------|---------------|
| Hero gallery — large left tile         | `assets/images/gallery-1.jpg`       | Near-square   |
| Hero gallery — top right (wide)        | `assets/images/gallery-2.jpg`       | Landscape     |
| Hero gallery — bottom middle           | `assets/images/gallery-3.jpg`       | Any           |
| Hero gallery — bottom right            | `assets/images/gallery-4.jpg`       | Any           |
| Showreel video                         | `assets/videos/showreel.mp4`        | 16:9          |
| Showreel cover frame                   | `assets/images/showreel-poster.jpg` | 16:9          |
| "In practice" — middle card            | `assets/videos/work-2.mp4` (silent loop) | Square   |

The gallery crops each photo to fit its tile. To change which part shows, edit the `.g-a img` … `.g-d img` `object-position` lines in `styles.css`.

Tips: keep photos under ~500 KB (export at ~1600px wide), videos as H.264 MP4 under ~15 MB.

## Before going live

- Booking buttons link to Calendly. Testimonials live in the `<!-- TESTIMONIALS -->` section of index.html.
- Edit the tools list in the `#tools` section to match the tools you actually support.

## Adding a story

1. Put the photos in `assets/images/stories/<story-name>/` (resize to ~1800px wide first).
2. Copy `stories/student-ai-prompt-a-thon.html` to `stories/<story-name>.html` and replace the title, text and image paths.
3. In `index.html`, find the `<!-- STORIES -->` section, copy one `<article class="story-card">` block and point it at the new page.
   Stories sit in one horizontal scroller; put the newest first. The counter and arrows update automatically. For a poster-style image, add class "story-img-poster" to its figure so it is not cropped.
