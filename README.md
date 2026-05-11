# BLACK FONDU OS V2

A single-page retro-90s void-club webapp: sign in, zoom into the void, upload your own audio, and submit tracks to a room of blurred-face dancers with unilateral taste.

## Login

- Username: `username`
- Password: `password`
- `Forgot Password` lets you in anyway.

## Behavior

- Before music: the bodies dance constantly in a black void.
- When you press **PLAY**: the music starts, the bodies turn toward the camera, and they stop moving.
- When music is paused or stopped: the bodies dance again.
- After a few **SKIP** presses, the room may randomly approve a track. Approved tracks make the dancers move even while music is playing.
- Uploads are local browser object URLs. No tracks are sent anywhere.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints in your terminal.

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Create a new GitHub repo named `black-fondu-os-v2`.
2. Upload these files.
3. Run `npm install` and `npm run build` locally or in a GitHub Action.
4. Publish the `dist/` folder with GitHub Pages.

## Notes

This repo uses CSS/React to create 3D-styled dancers without shipping external human model assets. Faces are intentionally obscured with blur, and uploaded audio stays on the user’s machine.
