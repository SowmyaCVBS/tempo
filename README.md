# Tempo

A tiny, self-hosted task board — one thing at a time, timed micro-steps, and a parking lane for stray ideas.

**Live:** https://sowmyacvbs.github.io/tempo/

## How it works
- This repo holds the **app only** (`index.html`). No tasks, no secrets live here.
- Task data lives in a separate **private** repo (`tempo-data`) as `board.json`.
- On first load you paste a GitHub fine-grained token (Contents read/write on `tempo-data`). The board reads/writes `board.json` over the GitHub API, so it stays in sync across every browser and device.

## Use it anywhere
Open the live URL, paste the token once. The sync pill (top-right) refreshes or disconnects. On a shared/work machine, hit **Disconnect** when you're done.
