# Calendrift

An infinite-scroll journal calendar built with React + Tailwind.

**Live:** <https://calendrift.vercel.app/>

## Features 

- Infinite vertical month scrolling
- Dynamic month/year header
- 42-cell month grid (leap years handled)
- Journal chips + swipeable entry modal
- Add-entry form with basic validation
- Local Storage persistence

## Tech

- React (Vite)
- Tailwind CSS
- Zustand

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

## Data

- Sample entries are in public/sample.json.
- New entries are saved to Local Storage under the key calendrift-journal-v1.
