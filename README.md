# Linear Transformations — Visual Explorer

An interactive browser-based tool for exploring **2×2 linear transformations** and core linear algebra concepts through real-time visualisation.

🔗 **[Live demo →](https://ardaozcelebi.github.io/LinearTransformations/)**

![Linear Transformations screenshot](https://github.com/ArdaOzcelebi/LinearTransformations/assets/screenshot.png)

---

## What is this?

This project lets you enter any 2×2 matrix and immediately see how it transforms 2D space on an interactive canvas. It includes five learning modules that each highlight a different concept from linear algebra:

| Module | What you can explore |
|---|---|
| **Geometric Transforms** | Rotation, scaling, shearing, reflections, and projections via preset buttons |
| **Determinant** | How the determinant scales (and flips) areas — visualised as a shaded parallelogram |
| **Eigenvectors** | Eigenvector directions and eigenvalues drawn on the canvas in real time |
| **Basis Vectors** | How the standard basis vectors **i** and **j** move under the transformation |
| **Gaussian Elimination** | Step-by-step row operations to solve Ax = b using the current matrix |

Features:
- Real-time canvas rendering with adjustable grid and basis-vector overlays
- Smooth animated interpolation from the identity matrix to any target matrix
- Editable matrix input with direct number entry
- Preset matrices for common transformations

---

## Running locally

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ArdaOzcelebi/LinearTransformations.git
cd LinearTransformations

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The page will hot-reload whenever you save a file.

### Other useful commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build for production (output to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for bundling and the dev server
- [math.js](https://mathjs.org/) for numerical computations
- HTML5 Canvas for rendering

---

## Adding a new module

1. Create a folder under `src/modules/YourModule/` with an `index.tsx` and an optional CSS module.
2. Export an object that satisfies the `LinearAlgebraModule` interface (see `src/modules/index.ts`).
3. Import it in `src/App.tsx` and add it to the `MODULES` array.

---

## Deployment

The site is automatically built and deployed to GitHub Pages on every push to `main` via the workflow in `.github/workflows/deploy.yml`.
