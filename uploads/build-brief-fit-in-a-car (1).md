# Build brief — "Will it fit in Matthew's car?"

An interactive lesson teaching decision trees to a Year 4 class (ages 8–9).
Audience for the artifact itself: the founder of a tutoring company, who will
open it alone, without narration. It must run start to finish with nobody
explaining it.

---

## 1. What to build

A single self-contained HTML file — no build step, no dependencies, opens by
double-clicking, works offline. Eight linear beats with a back control, so any
beat can be re-run without restarting.

One persistent visual runs through it: a decision tree drawn as a **road
junction**, with answers travelling down it like a satnav route.

---

## 2. Design direction

**Do not** produce the default AI look: cream background with a serif display
and a terracotta accent; near-black with a single acid accent; or a fake
broadsheet of hairline rules and zero border-radius. Take the direction below.

### Concept: roadside

The visual world is British road signage and vehicle weight plates — what you'd
actually see on a journey with an animal in the back. Chunky signage panels,
weighbridge readouts, route lines, a warning triangle for a refusal. Every
colour and type decision comes from there.

### Palette

| Token | Hex | Use |
|---|---|---|
| `--tarmac` | `#20262A` | text, route lines, dark panels |
| `--sign` | `#0B6E3C` | signage green, verdict FITS |
| `--verge` | `#EAEFE9` | page background |
| `--panel` | `#FFFFFF` | cards and signage faces |
| `--amber` | `#F0A81C` | highlights, winning split, warnings |
| `--stop` | `#BE3A2B` | verdict DOES NOT FIT |
| `--kerb` | `#C6CEC8` | rules, borders, inactive route |

### Typography

- **Display:** Bricolage Grotesque 700 — chunky, slightly odd, signage-like.
  Headlines and verdicts only. Tight tracking (`-0.02em`).
- **Body:** Inter 400/600. Minimum 17px — children read this.
- **Measurements:** Space Mono 400. Every weight and length renders in mono,
  like a weighbridge readout. Not decoration: it marks which numbers are *data
  the computer was given* as opposed to prose.

### Signature element

**The tree is a road junction, and answers draw a route down it.**

SVG, thick rounded route lines. As each question is answered, the relevant
segment illuminates — animate `stroke-dashoffset` so the route *draws itself*
forward in amber over the grey inactive line. The verdict arrives as a signage
panel at the end of the route.

Spend the boldness here. Everything else stays quiet.

### Motion

Purposeful, not scattered. Honour `prefers-reduced-motion` throughout.

- Route segments draw over ~500ms, `cubic-bezier(.2,.7,.3,1)`.
- Cards enter with a short slide-and-settle, ~250ms.
- Question panels cross-fade. Do not bounce them.
- Verdicts land like a stamp: scale 1.08 → 1.0 over 180ms, no rotation.
- Score bars in beat 8 grow from zero, staggered 80ms, so the eye watches them
  race and sees the winner arrive.

**No loading spinners before verdicts.** The whole lesson argues the computer is
walking three steps down a list, not thinking. A spinner contradicts that. If a
pause is needed, let the route finish drawing — that *is* the computation, made
visible.

### Imagery

Each animal and object needs a picture. In order of preference:

1. Flat vector illustrations, consistent line weight, one palette, transparent
   backgrounds.
2. Openly licensed photography (Unsplash / Pexels), squared, colour-graded to a
   single treatment.
3. Large-scale emoji as fallback — legible, safe, zero licensing risk, but flat.

No image-search results; this is going to a company. Whatever is chosen, apply
identical crop, size and treatment to all of them. Inconsistent imagery reads as
sloppiness faster than no imagery does.

---

## 3. The data

`fits = weight ≤ 150 kg AND length ≤ 1.5 m AND safe to carry`

Matthew is in the car too, which sets the weight limit. The car door is 1.0 m —
this becomes the third question, which is offered and never chosen.

### Training table

Safety is added mid-lesson (beat 6). The first tree is built from the top 16
rows with the safety column hidden; the second tree from all 18 rows with it
visible.

| Animal | Weight | Length | Height | Safe? | Fits? |
|---|---|---|---|---|---|
| rooster | 3 kg | 0.5 m | 0.7 m | ✅ | ✅ |
| cat | 4 kg | 0.5 m | 0.3 m | ✅ | ✅ |
| rabbit | 2 kg | 0.4 m | 0.25 m | ✅ | ✅ |
| Great Dane | 70 kg | 1.3 m | 0.85 m | ✅ | ✅ |
| penguin | 25 kg | 1.1 m | 1.1 m | ✅ | ✅ |
| goat | 60 kg | 1.3 m | 0.9 m | ✅ | ✅ |
| border collie | 20 kg | 1.0 m | 0.55 m | ✅ | ✅ |
| python | 30 kg | 4.0 m | 0.2 m | ✅ | ❌ |
| monitor lizard | 20 kg | 2.0 m | 0.3 m | ✅ | ❌ |
| kangaroo | 85 kg | 1.6 m | 1.6 m | ✅ | ❌ |
| alligator | 100 kg | 3.0 m | 0.4 m | ❌ | ❌ |
| pig | 250 kg | 1.4 m | 0.9 m | ✅ | ❌ |
| black bear | 200 kg | 1.4 m | 0.9 m | ✅ | ❌ |
| gorilla | 180 kg | 1.4 m | 1.5 m | ✅ | ❌ |
| elephant | 4000 kg | 6.0 m | 3.0 m | ✅ | ❌ |
| horse | 500 kg | 2.4 m | 1.6 m | ✅ | ❌ |
| **skunk** *(added beat 6)* | 4 kg | 0.6 m | 0.3 m | ❌ | ❌ |
| **porcupine** *(added beat 6)* | 12 kg | 0.8 m | 0.3 m | ❌ | ❌ |

### Held out — never in the table

| Animal | Weight | Length | Height | Purpose |
|---|---|---|---|---|
| warthog | 90 kg | 1.4 m | 0.75 m | unseen animal, handled correctly |

### Do not casually edit this roster

Six animals exist solely to stop one question solving everything:

- **python, monitor lizard, alligator** — light but long, so weight alone fails.
- **pig, black bear, gorilla** — heavy but short, so length alone fails.

**Only skunk, porcupine and alligator are unsafe.** This is critical. Marking
more animals unsafe makes safety the root question and deletes the length
question entirely — which destroys the python moment in beat 4. Verified.

### Verified scores

Splits are scored by **how many animals are left in the wrong pile** — fewest
wins, ties broken by which split is more even.

**Before safety (16 animals):**

| Question | Mistakes | |
|---|---|---|
| Longer than 1.5 m? | **3** | winner |
| Heavier than 150 kg? | 4 | |
| Taller than the car door? | 6 | never used |

**After safety (18 animals):**

| Question | Mistakes | |
|---|---|---|
| Longer than 1.5 m? | **5** | winner |
| Heavier than 150 kg? | 6 | |
| Taller than the car door? | 7 | still never used |
| Safe to carry? | 7 | used at depth 3 |

### The two trees

```
BEFORE (depth 2)                    AFTER (depth 3)
Longer than 1.5 m?                  Longer than 1.5 m?
├ yes → DOES NOT FIT (6)            ├ yes → DOES NOT FIT (6)
└ no  → Heavier than 150 kg?        └ no  → Heavier than 150 kg?
        ├ yes → DOES NOT FIT (3)            ├ yes → DOES NOT FIT (3)
        └ no  → FITS (7)                    └ no  → Safe to carry?
                                                    ├ no  → DOES NOT FIT (2)
                                                    └ yes → FITS (7)
```

"Taller than the car door" never appears in either tree. That is deliberate and
is the payload of beat 8.

---

## 4. The eight beats

### Beat 1 — What fits in my school bag?

Six items on screen: 🍎 apple · 📏 ruler · 🍱 lunch box · ⚽ football · 🧱 brick ·
📱 phone.

Ask: *which of these can I bring to school in my bag?*

Reveal, grouped by reason:

- **These are fine** — apple, ruler, lunch box.
- **This won't fit** — football.
- **This fits, but it's far too heavy** — brick.
- **This fits, but it isn't allowed** — phone.

Then the line: *You worked that out in about two seconds. How would we teach a
computer to do it?*

**The three reject reasons — won't fit, too heavy, not allowed — are the three
questions the animal tree ends up asking.** Same structure, twice, ten minutes
apart. Call it back explicitly in beat 8.

### Beat 2 — Meet Matthew

Matthew loves animals and has a brand new car. His rooster, his Great Dane, his
elephant. He says the first two fit and the elephant does not.

He's right — but *on what basis?* And how do we teach that to a computer, so
when a brand new animal turns up, it can decide on its own?

### Beat 3 — What should we measure?

Three candidate questions as signage panels, all sounding equally sensible:

- Is it heavier than 150 kg? *(Matthew's in the car too — the car has a limit)*
- Is it longer than 1.5 m? *(it has to fit across the back seat)*
- Is it taller than the car door? *(it has to get in)*

Let the child pick which they think matters most. Record it silently. Do not
comment. It's called back in beat 8.

### Beat 4 — Walk three animals through

Text box: **enter the name of an animal.** Autocomplete from the table;
suggestions are rooster, elephant, python.

For each: the animal card appears with its mono measurements. Questions arrive
one at a time as signage panels with Yes / No. Each answer draws the next route
segment. The verdict panel lands at the end.

- **rooster** → light, short → FITS
- **elephant** → both fail → DOES NOT FIT
- **python** → *light enough*, far too long → DOES NOT FIT

The python matters most. It's the first time one answer overrides another, and
it's why two questions are needed rather than one. Give it a line: *Light
enough. Nowhere near short enough.*

### Beat 5 — An animal Matthew has never seen

A **warthog** wants a lift. It was never in the table. Nobody wrote a rule for it.

90 kg, 1.4 m → **FITS**.

*Nobody told it about warthogs. It worked it out from the questions.* That's the
point of the whole exercise.

### Beat 6 — The skunk, and a new question

A **skunk** wants a lift. 4 kg, 60 cm. The tree returns **FITS**, in full signage
green. Hold it.

Then, handwritten: *It fits. It absolutely fits.* Beat. *Nobody gave the computer
a question about smell.*

Land it: **the computer only knows what we chose to measure.** It never asked
whether this was a good idea, because nobody gave it that column.

**Then fix it.** A human — not the computer — adds a column: *is it safe to
carry?* Mark the skunk, the porcupine and the alligator as no. Press **rebuild**.

Show both trees side by side, the new one drawing itself in. It has not grown a
branch on the end — it is a **different tree**, three questions deep instead of
two.

*Nobody rewrote the rules. We gave it one more thing to measure, and it built
itself a new tree.*

This is the strongest moment in the lesson. Give it the full screen.

### Beat 7 — Sorting into columns

*(This is the interactive heart. See §5 for the animation spec.)*

All 18 animals as cards in one jumbled pile — green border = fits, red = doesn't.
Four question buttons.

The child picks a question, and **the cards fly into two labelled columns**, YES
and NO. Cards that end up in the wrong column get a ringed outline. A counter
under each column shows how many are misplaced, and a running total sits between
them.

The child changes the question and **the same cards re-fly into new positions**.
This is the core mechanic — the animals physically rearranging as the question
changes is what makes "a good question sorts them tidily" a thing you can see
rather than a thing you're told.

Let them try all four. The totals tell the story: length 5, weight 6, height 7,
safety 7.

### Beat 8 — Who chose the questions?

Reveal: nobody. It counted.

Press **Let the computer choose** — all four score bars race, winner in amber.
Then it recurses: the still-muddled column gets the same treatment, and again,
until every column is pure. Three rounds, and the tree is built.

Two closing panels:

- **The rejected question.** *It never once asked whether the animal was taller
  than the car door.* If the child chose that in beat 3, call it back by name.
  It sounded useful. Counting said otherwise. Then tie back to beat 1: *won't
  fit, too heavy, not allowed — the same three things you checked in your school
  bag.*
- **This has a name.** Real algorithms do exactly this. **ID3** and **C4.5**
  score questions using *information gain*; **CART** — inside most software today
  — uses *Gini impurity*. We counted mistakes, which is simpler and gives the
  same tree here. All of them are doing what you just watched.

---

## 5. Beat 7 animation spec

This is the most important interaction in the build. Get it right.

### Layout

Two labelled columns side by side — **YES** on the left, **NO** on the right —
with the question text above them and a total-mistakes counter between the column
headers. Below, a row of four question buttons.

Before any question is picked, all cards sit in a single centred pile.

### The transition

Use a **FLIP** approach, not CSS-property animation on layout:

1. Record each card's bounding rect before the change (`First`).
2. Re-parent every card into its new column in the DOM (`Last`).
3. Compute the delta and apply an inverting `transform` so each card appears
   not to have moved (`Invert`).
4. Force reflow, then clear the transforms with a transition (`Play`).

Cards travel to their new homes over **450ms**, `cubic-bezier(.2,.7,.3,1)`, with
a **20ms stagger** by index so the pile flows rather than teleports. Use only
`transform` and `opacity` — never animate `top`/`left`/`width`.

Cards must keep a stable `key` / DOM node identity across question changes, so
the same physical card visibly travels from one column to the other. If cards are
destroyed and recreated, the whole effect is lost.

### After landing

- Cards in the wrong column get a **ringed outline** (`box-shadow: 0 0 0 3px
  var(--tarmac)`) applied 150ms after they settle, so the eye follows movement
  first and mistakes second.
- Column headers update: `YES · 6 animals · 0 in the wrong place`.
- The total counter between the columns **tweens numerically** rather than
  snapping — it's the number the whole beat is about.
- When a column is pure, tint its header `--sign`. When the total reaches its
  minimum for the available questions, pulse the total once in `--amber`.

### Reduced motion

Cards jump straight to final positions; rings and counters appear immediately;
no stagger, no tween.

### Responsive

Below 640px the columns stack vertically and cards shrink to a compact chip with
picture and name only. The flight animation still runs.

---

## 6. Teacher notes

A `<details>` panel at the foot, closed by default — the child never sees it, the
founder finds it immediately.

- **Objective.** Pupils can explain that a computer classifies things by asking a
  short chain of yes-or-no questions, and that the questions are chosen by
  counting rather than by knowing anything about the subject.
- **Why this framing.** "Fits in a car" is a threshold question — really "is it
  smaller than roughly this big". Numeric thresholds are what real decision trees
  split on, so this is not an analogy for the algorithm. It is the algorithm,
  with the arithmetic made countable.
- **Where the truth comes from.** The 16-row table is written by a human before
  the lesson starts. That's the training data. The computer is handed the answers
  and finds the shortest set of questions that reproduces them. The warthog is
  held out, which makes it a test case.
- **Who adds features.** The algorithm never invents the safety question. A human
  notices the skunk failure and adds a column. That's feature engineering, and
  it's the most common activity in applied machine learning. Adding a column
  triggers a full rebuild, not a graft.
- **Being straight about the maths.** Splits are scored by misclassification
  impurity. This is a genuine criterion, but production implementations use Gini
  or entropy, which respond more smoothly to changes that don't flip the majority
  class. The principle taught is unchanged.
- **The shape of this tree.** The data is a conjunction, so the tree comes out as
  a chain. Everything taught is accurate, but it doesn't demonstrate a tree
  asking *different* second questions on different branches. Fine for Year 4;
  worth knowing.
- **Checking understanding.** Ask why *"Is it an elephant?"* would be a poor first
  question. A child who says it sorts out one animal and leaves everything else
  muddled has understood information gain without meeting the term.
- **Support.** Run beat 7 with paper cards and two hoops on a table. Count the
  odd ones out by hand before touching a screen.
- **Stretch.** Add an animal that breaks the tree and ask what fifth question
  would be needed. This is how real models get extended when they meet data they
  weren't built for.
- **The question a sharp adult will ask.** *If this works so well, why isn't
  image recognition done with decision trees?* Because a child can name "pointy
  ears" but can't say which pixels make them pointy. Decision trees need features
  handed to them already measured. For images the features have to be learned,
  which is what neural networks are for.

---

## 7. Technical constraints

- One HTML file. No frameworks, no build step, no network calls at runtime.
  Fonts may load from Google Fonts with system fallbacks; must still work offline.
- No `localStorage` or `sessionStorage`. All state in memory.
- Images inlined as SVG or base64 where possible, so the file stays portable.
- Responsive to 380px. The junction diagram stacks vertically rather than
  shrinking to illegibility.
- Visible keyboard focus on every control. Real `<button>` elements.
- `prefers-reduced-motion: reduce` disables all transitions including the route
  draw — the route simply appears complete.
- Linear beat state with a back control.

---

## 8. What to avoid

- Loading spinners or "thinking" animations before a verdict.
- The word *algorithm* in child-facing copy. It appears in beat 8 only, attached
  to the real names ID3, C4.5, CART.
- Cartoon voice. Short sentences, concrete nouns, no babytalk. One joke, and it's
  the skunk.
- Decoration that doesn't encode something true.
- Any framing that sorts people rather than animals or objects.
