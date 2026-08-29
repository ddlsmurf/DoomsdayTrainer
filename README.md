# Doomsday Trainer

**[Open the trainer →](https://ddlsmurf.github.io/DoomsdayTrainer)**

**Train yourself to work out the day of the week for any date — in your head, in a
couple of seconds, with no calendar and no arithmetic on paper.** The method is
**Conway's doomsday rule**, broken into seven small steps you can drill one at a time.

A single self-contained web page. Open `index.html`; there is no build step, no server
requirement, no network access and no dependencies.

## Running it

    make            # list the targets
    make open       # open index.html straight from the filesystem
    make serve      # serve on http://127.0.0.1:8137 (use this to try it on a phone)
    make test       # syntax-check the page and verify every date from 1583 to 2999
    make test-page  # run the same verification inside the browser

`make test` needs `node`; `make serve` needs `python3`. Neither is needed to *use* the
page.

## Layout

    index.html        the entire app — markup, styles and script
    tools/selftest.mjs  headless verification of the algorithm (used by `make test`)
    Makefile

`index.html` is one file, but its script is divided into labelled sections, in order:

| Section | What lives there |
| --- | --- |
| core math | `isLeapYear`, `centuryAnchor`, `yearOffsetOdd11`, `yearOffsetClassic`, `monthDoomsday`, `dayOfWeekFor`, `explainDate`, `runSelfTest` |
| app constants | difficulty presets, storage keys, XP and level constants |
| RNG | seeded `mulberry32`, so a shared link reproduces the exact question stream |
| storage | validated `localStorage` loading and saving |
| state | the URL hash is the serialiser for the whole drill setup |
| derivation | `derivationSteps` / `renderDerivation` — the one place the algorithm is spelled out in words |
| module registry | the eight steps, declared as data; the UI is generic over them |
| statistics, achievements | derived from history; achievements are declarative rules |
| session, engine, rendering | question lifecycle and DOM rendering |
| learn panel, statistics dialog | the tutorial and the full stats view |
| animations, sound, toasts | canvas particle effects and feedback |
| events, settings, init | delegation, keyboard handling, bootstrap |

The core math region is pure and DOM-free, and is marked by `/* CORE MATH START */` and
`/* CORE MATH END */`: `tools/selftest.mjs` extracts exactly that region and runs it
under node, so the tested code is literally the shipped code. It is also the single
source of truth for every drill, every worked solution and every example — no formula
appears twice.

## The steps

Each is a drill of its own; move between them freely, in any order.

1. **Leap year?** — the ÷4, ÷100, ÷400 rule (century years show up more often than chance)
2. **Century anchor** — Tue, Sun, Fri, Wed, repeating every 400 years
3. **Year offset** — how far the year's doomsday has drifted inside its century
4. **The year's doomsday** — anchor + offset
5. **The month's doomsday date** — 4/4, 6/6, 8/8, 10/10, 12/12, the 9-5 / 7-11 pairs, and February's last day
6. **Shift** — count from the month's doomsday to the target date
7. **Full date** — the whole thing, nothing given

Plus a **Learn** panel, which is where every visit starts unless a link says otherwise. It is seven separate
cards, each on its own tinted surface so they never run together: what the page is for;
the seven steps summarised in a line each (click one to drill it); a full worked example
of any date you choose; the two year-offset methods side by side on the same year; the
three modes; the cheat sheets, as tabs (century anchors / month doomsdays); and the
credits, with the Wikipedia links inline in the prose. The ℹ️ button in the header jumps
to the credits and flashes that card for a moment; the *Compare both methods* link in
the worked example does the same for the methods card.

Two visual shapes are used consistently, so a glance tells you what a group of boxes
means: a **sequence** (the seven steps of a worked solution) is chained by a line running
from each box into the next, top to bottom, in one column at every screen size; a
**choice** (the two offset methods, the three modes) is a row of cards separated by
“or”, each with a radio dot showing which one is active. Nothing else uses either shape.
Where the sequence meets the choice — just before step 3 in the Learn walkthrough — a
note on the chain says so and links down to the comparison.

Every drill card carries its own **How this step works** panel — the rule for that step
with the relevant table right there (anchors, month dates, the procedure for whichever
offset method you chose). It is open by default and remembers whether you collapsed it,
and links through to the full explanation on the Learn page.

Getting an answer wrong (or pressing *Show solution*) always prints the working with
every intermediate value, not just the answer — but only the steps that bear on the
question: the leap-year drill prints one step, the year's doomsday prints the three that
build it, and the full-date step prints all seven. Steps keep their number in the whole
algorithm wherever they appear, so step 3 is always the year offset. **Example** prints a fully worked
fresh case at any time without touching the question you are on or your statistics.

### Two year-offset methods

Step 3 can be computed two ways, which always agree:

- **odd + 11** — if the two-digit year is odd add 11; halve; if odd add 11; mod 7;
  count back from 7.
- **dozens / remainder / quarters** — `yy = 12a + b`, then `(a + b + ⌊b/4⌋) mod 7`.

Pick either in Settings; the drill and every worked solution follow the choice. The
Learn panel explains the trade-off.

## Modes

- **Practice** — untimed; a miss just shows the working and nothing ends the session
- **Sprint** — 30 s / 60 s / 2 min / 5 min; score is correct answers, best kept per step and range
- **Survival** — one wrong answer ends the run; longest run kept per step and range

The current mode is named and explained on the drill card itself, in a toast when you
switch, in the Learn panel and in the `?` dialog. When a sprint or a run ends, the last
answer stays on screen — the verdict, which key you pressed, and the full working — so
it is always clear whether you were right.

## The long game

Fluency comes from short, frequent sessions, so the side column tracks the rhythm rather
than just the totals:

- **Last practised**, in plain words — *13 hours ago*, *yesterday*, *6 weeks ago*
- **Day, week and month streaks** — a period counts if you answered anything in it, and
  the current period never breaks a streak until it has actually passed. The count is always
  shown, zero included; below two it is not a run yet, so the tile fades, its border goes
  dashed and it carries the date that would extend it (*1 / month streak / by Wed, 30 Sep*).
- **A nudge** saying the one thing worth knowing right now, which turns into a warning
  before something lapses: *One question today keeps your 4-day streak alive*, *Your
  3-week streak needs a session this week — 2 days left*. A warning also arrives as a
  toast when you open the page.
- **Achievements for staying with it** — five and thirty days running, four and twelve
  weeks running, three, six and twelve months running, and one for coming back after a
  month away.

## State

- **The URL hash** holds seed, step, mode, year range, offset method and question number,
  so a link reproduces the exact drill — including the same questions in the same order.
- **`localStorage`** holds four keys: `doomsday.settings.v1`, `doomsday.history.v1`
  (the last 5000 attempts), `doomsday.progress.v1` (lifetime counters, records, practice
  days) and `doomsday.achievements.v1`. Statistics are derived from history rather than
  stored twice. A key that cannot be parsed or validated is reported in a banner showing
  the offending JSON, with a button to erase that one key — nothing is silently
  discarded. Export or erase everything from Settings.

## Keyboard

| Key | Action |
| --- | --- |
| `0`–`6` | pick a weekday (0 = Sunday) or an offset |
| digits, `Enter`, `Backspace` | type a day-of-month answer |
| `Y` / `N` | answer a leap-year question |
| `Enter` | next question |
| `[` `]` | previous / next step |
| `Alt`+`0`–`7` | jump to a step (0 = Learn) |
| `S` / `H` / `E` | skip / show solution / worked example |
| `M` / `T` / `?` | cycle mode / statistics / shortcuts |

Everything is reachable by touch and mouse too; targets are at least 44 px, the answer
pad sits within thumb reach on phones, and the layout uses three columns on desktop,
two on tablets and one on phones.

A correct answer always fires a **core burst** at the answer itself — a ring, thirty
trailing sparks and a handful of stars, peaking within a few frames — plus one of seven
effects at random: confetti ribbons that flip as they fall, a starburst, a spiral, a soft
bloom of rings, and, on streaks and records, a fountain, comets with breaking tails or
fireworks that rise and burst. The four that open at the answer are the only ones a quick
drill can draw, so a fast correct answer is never met with silence. Each burst draws from a palette generated on
the spot (a random base hue plus an analogous, triad, split-complementary or warm
spread), so it is colourful without being random-looking, and everything is drawn at
partial opacity — average around 0.35, never above 0.85 — so it reads as celebratory
rather than glaring. Long streaks, personal bests and achievements layer a second effect
and raise the intensity; a typical correct answer puts about 115 particles on screen,
over a hundred of them alive in the first frame.

No two bursts of the same effect are identical: the spiral, for instance, redraws its
whole figure each time — one to four arms, either direction, how tightly it winds, how
far the ellipse is squashed and tipped over, and whether it is made of dots or stars.

Motion is the page's own setting and does not consult the system's reduced-motion
preference: celebrations are **on** until you turn them off in Settings.

## Credit

The rule is **John Horton Conway's** (1937–2020), devised in 1973 on top of an earlier
method of Lewis Carroll's. See
[the doomsday rule](https://en.wikipedia.org/wiki/Doomsday_rule) and
[Conway](https://en.wikipedia.org/wiki/John_Horton_Conway) on Wikipedia. The page's
Learn panel carries the same history.
