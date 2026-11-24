# Bagua project handoff

Bagua is a static learning site with Animals, Numbers, and Trigrams views of the same Later Heaven Bagua board. Open [index.html](index.html) in a browser to work locally. The site uses plain HTML, CSS, and JavaScript and runs without a build step or package install.

The published baseline at handoff is `b92570a` (Add Bagua Colors). GitHub Pages serves the root of `main`. [Public repository](https://github.com/nortonmd/Bagua) · [Live site](https://nortonmd.github.io/Bagua/) · [Published commit](https://github.com/nortonmd/Bagua/commit/b92570a)

## Where to make changes

| File | What it owns |
| --- | --- |
| [index.html](index.html) | View buttons above the board, marker hint, Numbers controls below the board, and the marker detail dialog. |
| [bagua.js](bagua.js) | Marker data and positions, rendering for all three views, dialog contents, and the Numbers animations. |
| [styles.css](styles.css) | Octagon shape and colors, responsive layout, artwork crops, animation styling, and reduced-motion rules. |
| [Animal artwork](assets/bagua-animals-ink-wash.png) | The active transparent 3×3 ink-and-wash sprite sheet. The earlier sheets in `assets/` and the three reference JPGs at the project root are reference material. |

Update the `markers` array in `bagua.js` for animal, number, trigram, or phase associations. Its first eight records run clockwise from the top, in the order **9, 2, 7, 6, 1, 8, 3, 4**. The final record is the center **5**. Array order sets the circular positions. The same marker buttons are reused across the three views.

| Number | Animal | Trigram image | Phase and color |
| --- | --- | --- | --- |
| 1 | Snake | Kǎn · Water | Water · black |
| 2 | Unicorn | Kūn · Earth | Earth · yellow |
| 3 | Dragon | Zhèn · Thunder | Wood · blue-green |
| 4 | Phoenix | Xùn · Wind | Wood · blue-green |
| 5 | Center | | Earth · yellow |
| 6 | Lion | Qián · Heaven | Metal · white |
| 7 | Monkey | Duì · Lake | Metal · white |
| 8 | Bear | Gèn · Mountain | Earth · yellow |
| 9 | Hawk | Lí · Fire | Fire · red |

Trigram lines are stored top to bottom. Yin is broken and yang is solid. Phase colors come from the `.phase-*` rules in `styles.css`. The trigram image and phase are separate fields. Duì, for example, represents Lake and uses the white Metal palette. [Trigram commentary](https://koyomidays.com/en/i-ching/zhouyi/shuogua/) · [Five-phase colors](https://libokang.com/en/classics/zonghe/the-great-meaning-of-the-five-phases/)

To replace the art, keep the sprite sheet square with equal cells, transparent margins, and an empty center. The current rows are Hawk / Unicorn / Monkey, Lion / empty / Snake, and Bear / Dragon / Phoenix. Each marker’s `art: [column, row]` uses zero-based coordinates. Update the `.animal-art` background URL to switch sheets.

## Numbers animations

- **Play** uses `numberedMarkers` in ascending order and `stepDuration` for the 800 ms highlight interval. One octagon is highlighted at a time, and the highlight clears after 9.
- **= 15** uses `squareRows` to place the markers as `4 9 2`, `3 5 7`, `8 1 6`. `squareLines` derives the three rows, three columns, and two diagonals in playback order. Signs fade between equations, and the board returns to the circle after the final sum.
- **Walking** scales the markers to 75%. Footsteps start below 1 and head left. Odd numbers are walked clockwise and even numbers counterclockwise. Only 1, 5, and 9 get full circles. `walkingConnections` calculates tangent exits for the partial turns. `walkingSteps()` adds curved departures after the full loops at 1 and 5. Previous footsteps fade as the next number starts, then the board returns to full size after 9. Recheck path clearance if marker positions, footprint sizes, or walking radii change.

The Numbers animations are mutually exclusive. Starting Walking or = 15 ends ordinary Play. Each animation can be stopped, and changing views clears the active animation, timers, and temporary state. The shared `#play-status` live region announces progress. CSS suppresses transitions and the footprint reveal animation when reduced motion is enabled.

## Verify an update locally

Open `index.html` directly. To preview it over HTTP, run this from the project root and open `http://127.0.0.1:8000/`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Run `node --check bagua.js` and `git diff --check`. Use a browser for the behavior checks. The repository has no checked-in automated test suite.

1. Check at desktop and narrow phone widths. Animals should open by default. Switch among all three views and confirm that the same positions, colors, and center marker carry across.
2. Open a marker with the keyboard, check that Snake shows Kǎn · Water and yin, yang, yin, and press Escape. Focus should return to the marker.
3. In Numbers, run Play, = 15, and Walking to completion. Confirm that Play highlights 1 through 9, = 15 shows all eight sums, and Walking exits partial loops toward the next number without doubling back.
4. Test Stop, replay, and switching views during an animation. Check that no highlights, equations, or footprints carry over. Repeat with reduced motion enabled if changing animation code.

## Publish to GitHub Pages

Keep script, stylesheet, and artwork URLs relative so the site works under `/Bagua/`. Commit the intended changes and push `main` to `origin`. GitHub Pages deploys from the root of that branch automatically.

```sh
git push origin main
gh api repos/nortonmd/Bagua/pages/builds/latest --jq '{status, commit, error: .error.message}'
```

Wait for `status` to be `built` and confirm that `commit` matches the push. Open the live site and check the changed feature once it deploys. If a browser still shows the previous version, reload with its cache disabled and check the deployed resource in the Network tab. [Live site](https://nortonmd.github.io/Bagua/)
