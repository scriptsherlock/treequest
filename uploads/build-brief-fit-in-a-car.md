# Build brief — "Will it fit in Matthew's car?"

An interactive lesson teaching decision trees to a Year 4 class (ages 8–9).
Audience for the artifact itself: the founder of a tutoring company, who will
open it alone, without narration.

---

## 1. What to build

A single self-contained HTML file, no build step, no dependencies, that opens
by double-clicking and works offline. It runs a linear seven-beat lesson with
one persistent visual: a decision tree drawn as a **road junction**, which the
answers travel down like a satnav route.

It must run start to finish without anyone explaining it.

---

## 2. Design direction

**Do not** produce the default AI look: cream background with a serif display
and a terracotta accent; or near-black with one acid accent; or a broadsheet
grid of hairline rules. Take the direction below instead.

### Concept: roadside

The visual world is British road signage and vehicle weight plates — the things
you'd actually see on a journey with an animal in the back. Chunky signage
panels, weighbridge readouts, route lines, a warning triangle for a refusal.
This is where every colour and type decision comes from.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--tarmac` | `#20262A` | text, route lines, dark panels |
| `--sign` | `#0B6E3C` | primary signage green, verdict FITS |
| `--verge` | `#EAEFE9` | page background |
| `--panel` | `#FFFFFF` | cards and signage faces |
| `--amber` | `#F0A81C` | highlights, the winning split, warnings |
| `--stop` | `#BE3A2B` | verdict DOES NOT FIT |
| `--kerb` | `#C6CEC8` | rules, borders, inactive route |

### Typography

- **Display:** Bricolage Grotesque, 700 — chunky, slightly odd, signage-like.
  Used for headlines and verdicts only.
- **Body:** Inter, 400/600 — everything else.
- **Measurements:** Space Mono, 400 — every weight and length renders in mono,
  like a weighbridge readout. This is not decoration: it marks which numbers are
  *data the computer was given* versus prose.

Set a clear scale. Headlines are large and tight (`letter-spacing: -0.02em`).
Body is 17px minimum — children read this.

### Signature element

**The tree is a road junction, and answers draw a route down it.**

Render the tree as an SVG with thick rounded route lines. As each question is
answered, the relevant segment illuminates — animate `stroke-dashoffset` so the
route *draws itself* forward, amber, over the grey inactive line. The verdict
node arrives as a signage panel at the end of the route.

Spend the boldness here. Everything else stays quiet.

### Motion

Purposeful, not scattered. Respect `prefers-reduced-motion` throughout.

- Route segments draw over ~500ms with `cubic-bezier(.2,.7,.3,1)`.
- Animal cards enter with a short slide-and-settle, ~250ms.
- Question panels cross-fade; do not bounce them.
- The verdict lands like a stamp: scale from 1.08 to 1.0 over 180ms, no rotation.
- In beat 7, score bars grow from zero left-to-right, staggered 80ms apart, so
  the eye watches them race and sees the winner arrive.

**Do not** add a fake loading spinner before verdicts. The whole lesson argues
that the computer is walking three steps down a list, not thinking. A spinner
undercuts that. If a beat is needed, let the route finish drawing — that *is*
the computation, made visible.

### Imagery

Each animal needs a picture. In order of preference:

1. Commissioned or generated flat vector illustrations, consistent line weight,
   one palette, on transparent backgrounds.
2. Openly licensed photography (Unsplash / Pexels), squared and colour-graded to
   a consistent treatment.
3. Large-scale emoji as a fallback — legible, safe, zero licensing risk, but
   flat and less impressive.

Do not use image search results. This artifact will be shown commercially.
Whatever is chosen, apply the same crop, size, and treatment to all of them —
inconsistent imagery reads as sloppiness faster than no imagery does.

---

## 3. The data

`fits = weight ≤ 150 kg AND length ≤ 1.5 m`

Matthew is in the car too, which is why the weight limit is what it is. The car
door is 1.0 m — this becomes the third, rejected question.

### Training table (16 animals — shown to the class)

| Animal | Weight | Length | Height | Fits? |
|---|---|---|---|---|
| rooster | 3 kg | 0.5 m | 0.7 m | ✅ |
| cat | 4 kg | 0.5 m | 0.3 m | ✅ |
| rabbit | 2 kg | 0.4 m | 0.25 m | ✅ |
| Great Dane | 70 kg | 1.3 m | 0.85 m | ✅ |
| penguin | 25 kg | 1.1 m | 1.1 m | ✅ |
| goat | 60 kg | 1.3 m | 0.9 m | ✅ |
| border collie | 20 kg | 1.0 m | 0.55 m | ✅ |
| python | 30 kg | 4.0 m | 0.2 m | ❌ |
| monitor lizard | 20 kg | 2.0 m | 0.3 m | ❌ |
| kangaroo | 85 kg | 1.6 m | 1.6 m | ❌ |
| alligator | 100 kg | 3.0 m | 0.4 m | ❌ |
| pig | 250 kg | 1.4 m | 0.9 m | ❌ |
| black bear | 200 kg | 1.4 m | 0.9 m | ❌ |
| gorilla | 180 kg | 1.4 m | 1.5 m | ❌ |
| elephant | 4000 kg | 6.0 m | 3.0 m | ❌ |
| horse | 500 kg | 2.4 m | 1.6 m | ❌ |

### Held-out animals (never in the table)

| Animal | Weight | Length | Height | Tree says | Truth |
|---|---|---|---|---|---|
| warthog | 90 kg | 1.4 m | 0.75 m | fits | correct |
| skunk | 4 kg | 0.6 m | 0.3 m | fits | *technically* correct |

### Why the roster is shaped this way — do not casually edit it

Four animals exist purely to stop one question solving everything:

- **python, monitor lizard, alligator** are light but long, so weight alone fails.
- **pig, black bear, gorilla** are heavy but short, so length alone fails.

Remove them and the tree collapses to a single question, and beat 7 has nothing
to teach. If animals are added or changed, re-verify that the scores below still
hold.

### Verified split scores at the root

Scored by **how many animals are left in the wrong pile** after the split —
fewest wins, ties broken by which split is more even.

| Question | Mistakes left | Result |
|---|---|---|
| Is it longer than 1.5 m? | **3** | winner |
| Is it heavier than 150 kg? | 4 | second |
| Is it taller than the car door? | 6 | never used |

### The resulting tree (depth 2)

```
Is it longer than 1.5 m?
├── yes → DOES NOT FIT   (6 animals)
└── no  → Is it heavier than 150 kg?
          ├── yes → DOES NOT FIT   (3 animals)
          └── no  → FITS           (7 animals)
```

"Taller than the car door" never appears. That is deliberate and is the payload
of beat 7.

---

## 4. The seven beats

### Beat 1 — What is this animal, and how do you know?

Three animal photographs. Child names each. Then: *how did you know?*

Surface the answers as chips: **pointy ears · whiskers · four legs · small**.
Land the word once, in a signage panel: **these are called FEATURES.**

Closing line: *The computer gets features and nothing else. No picture, no name.*

### Beat 2 — Meet Matthew

Matthew loves animals and has a brand new car. Show his rooster, his Great Dane,
and his elephant. He says the first two fit and the elephant does not.

He is right. But *on what basis?* And how do we teach that to a computer, so
that when a brand new animal turns up, it can decide on its own?

### Beat 3 — What should we measure?

Present three candidate questions as signage panels, all sounding equally sensible:

- Is it heavier than 150 kg? *(Matthew is in the car too — the car has a limit)*
- Is it longer than 1.5 m? *(it has to fit across the back seat)*
- Is it taller than the car door? *(it has to get in)*

Let the child pick which they think matters most. Record the choice silently —
it is called back in beat 7. Do not comment on it now.

### Beat 4 — Walk three animals through

Text box: **enter the name of an animal.** Autocomplete from the training table;
the three suggested are rooster, elephant, python.

For each: the animal card appears with its mono measurements. Questions arrive
one at a time as signage panels with Yes / No. Each answer draws the next route
segment on the junction. Verdict panel lands at the end.

- **rooster** → light, short → FITS
- **elephant** → both fail → DOES NOT FIT
- **python** → *light enough*, but far too long → DOES NOT FIT

The python is the important one. It is the first time one answer overrides
another, and it is why the tree needs two questions rather than one. Give it a
line: *Light enough. Nowhere near short enough.*

### Beat 5 — An animal Matthew has never seen

A **warthog** wants a lift. It was never in the table. Nobody wrote a rule for it.

Run it through: 90 kg, 1.4 m → **FITS**.

Line: *Nobody told it about warthogs. It worked it out from the questions.*
That is the entire point of the exercise.

### Beat 6 — The skunk

A **skunk** wants a lift. 4 kg, 60 cm.

The tree confidently returns **FITS**, in full signage green. Hold it for a beat.

Then the aside, in the handwritten voice: *It fits. It absolutely fits.*
*Nobody gave the computer a question about smell.*

Line to land: **the computer only knows what we chose to measure.** It never
asked whether this was a good idea, because nobody gave it that column.

This is the most valuable thirty seconds in the lesson. Give it room — full
screen, no other content competing.

### Beat 7 — Who chose the questions, and in what order?

Reveal: nobody did. It counted.

Show all 16 animals as chips, green for fits, red for not. Let the child click
each candidate question and watch the pile split in two, with the animals in the
wrong pile ringed. Show the mistakes remaining.

Then **Let the computer choose** — animate all three score bars racing, winner
in amber:

```
Is it longer than 1.5 m?          ███       3 left in the wrong pile
Is it heavier than 150 kg?        ████      4
Is it taller than the car door?   ██████    6
```

Recurse once on the remaining muddled pile, which resolves to pure. Show the
finished tree.

Then two closing panels:

- **The rejected question.** *It never once asked whether the animal was taller
  than the car door.* If the child chose that one in beat 3, call it back gently
  by name. It sounded useful. Counting said otherwise.
- **This has a name.** Real algorithms do exactly this. **ID3** and **C4.5**
  score questions using *information gain*; **CART** — the one inside most
  software today — uses *Gini impurity*. We counted mistakes, which is simpler
  and gives the same tree here. All of them are doing what you just watched.

---

## 5. Teacher notes

A collapsed `<details>` panel at the foot of the page, closed by default, so the
child never sees it and the founder finds it immediately.

Contents:

- **Objective.** Pupils can explain that a computer classifies things by asking a
  short chain of yes-or-no questions, and that the questions are chosen by
  counting rather than by knowing anything about the subject.
- **Why this framing.** "Fits in a car" is a threshold question — really "is it
  smaller than roughly this big". Numeric thresholds are what real decision trees
  split on, so this is not an analogy for the algorithm. It is the algorithm,
  with the arithmetic made countable.
- **Being straight about the maths.** Splits are scored by misclassification
  impurity — how many are left in the wrong pile. This is a genuine criterion,
  but production implementations use Gini or entropy, which respond more smoothly
  to changes that do not flip the majority class. The principle taught is
  unchanged.
- **The engineered surprise.** Six animals exist solely so that no single
  question solves the problem, and the third question is rejected outright.
- **Checking understanding.** Ask why *"Is it an elephant?"* would be a poor
  first question. A child who says it sorts out one animal and leaves everything
  else muddled has understood information gain without meeting the term.
- **Support.** Run beat 7 with paper cards and two hoops on a table. Count the
  odd ones out by hand before touching a screen.
- **Stretch.** Add an animal that breaks the tree — heavy, short, and it somehow
  does fit — and ask what fourth question would be needed. This is how real
  models get extended when they meet data they were not built for.
- **The question a sharp adult will ask.** *If this works so well, why isn't
  image recognition done with decision trees?* Because a child can name "pointy
  ears" but cannot say which pixels make them pointy. Decision trees need
  features handed to them already measured. For images, the features have to be
  learned — which is what neural networks are for.

---

## 6. Technical constraints

- One HTML file. No frameworks, no build step, no network calls at runtime.
  Fonts may load from Google Fonts with system fallbacks; everything must still
  work offline.
- No `localStorage` or `sessionStorage`. All state in memory.
- Images inlined as SVG or base64 where possible, so the file stays portable.
- Responsive down to 380px. The junction diagram stacks vertically on narrow
  screens rather than shrinking to illegibility.
- Visible keyboard focus on every control. Buttons are real `<button>` elements.
- `prefers-reduced-motion: reduce` disables all transitions and animations,
  including the route draw — the route should simply appear complete.
- Beat state is linear with a back control, so the founder can re-run any beat
  without restarting.

---

## 7. What to avoid

- Loading spinners or "thinking" animations before a verdict.
- The word *algorithm* anywhere in child-facing copy. It appears in beat 7 only,
  attached to the real names ID3, C4.5, CART.
- Cartoon voice. Short sentences and concrete nouns, not babytalk. One joke, and
  it is the skunk.
- Decoration that does not encode something true. If a divider, number, or icon
  is not carrying information, remove it.
- Any framing that sorts people rather than animals.
