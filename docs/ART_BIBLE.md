# Art bible

## Three cohesive visual directions

| Direction | Palette / treatment | Strength | Cost / risk |
| --- | --- | --- | --- |
| **Woodland Atlas — recommended** | Pine #263f3c, field #dce4bf, moss #77956d, lake #87b6b0, gold #d7ad59, paper #f8f5e9; softly shaped terrain, illustrated paths, restrained labels | Best match for friendly existing Kenney sprites; landmarks carry fantasy | Needs one coherent terrain/prop family |
| Twilight Lanterns | Twilight #263650, slate #526c87, mist #d8e0df, moon gold #dec17a, fern #6e977e; luminous grove and silhouettes | Strong magical tree/chest focal point | Darkness can conceal clues; sprite lighting needs validation |
| Carved Oak Adventure | Oak #66503c, bark #947252, linen #eadcbc, fern #66835c, brass #c9a75c; carved map frame and wooden signs | Tactile material vocabulary | Ornament risks repeating today's heavy panel density |

Choose Woodland Atlas. Emphasise the world and Tree; keep paper controls quiet. This is a design recommendation, not a pupil-preference study.

## Production frame

Plain HTML/CSS/JS, existing CC0 sprites and original local terrain/props. Slightly angled top-down view, soft oval contact shadows, consistent lighting. Avoid mixing pixel-art tiles, anime characters or photoreal environments. Stretched JPGs are palette references rather than final full-viewport worlds.

Local Trebuchet MS/Segoe UI/system sans-serif. Suggested scale: 16px body, 18px important instructions, 24–32px headings, 14px secondary copy. Verify 320px and 200% text/zoom. Avoid decorative all-caps and heavy text shadows. Keep lines below roughly 70 characters.

Hero approximately 56–72px tall; ordinary monster 64–88px; boss larger without covering clues. Preserve 192×256 hero source canvases, transparent margins and bottom-centre ground pivot. Initial terrain grid: 32 world units, 2× authoring if raster tiles are needed. Smooth filtering, not nearest-neighbour pixel filtering.

## Animation vocabulary

- Exploration: immediate controls, subtle step feedback, no constant full-screen bobbing.
- Tree: actual path/leaf emphasis; never invent changing numbers for an effect.
- Chest: separate base/lid/lock/light/item/shadow. Proposed timeline: lock 120ms, lid 240ms strong ease-out, item/light 200ms. Total optional reveal approximately 0.8–1.2s with Skip available immediately. These are game-feedback beats, not mandatory UI waits.
- UI: transform/opacity only, 120–250ms; keyboard navigation instant. Reduced motion uses immediate gear reveal/static path. Gate hover effects by pointer capability.
- Battle: existing attack/hurt/cheer poses; short transform-only throw/impact; no startling shake or repeated layout animation.

Asset names: assets/gear/world/<location>-<part>.svg and assets/gear/chest/<part>.svg, or documented layers in one SVG. Text remains HTML. Record provenance, dimensions, pivot and in-context approval in ASSET_MANIFEST.
