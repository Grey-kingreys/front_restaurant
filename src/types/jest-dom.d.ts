// Enregistre les matchers de @testing-library/jest-dom (toBeInTheDocument, etc.)
// aupres de TypeScript.
//
// Ils sont charges a l'execution par `jest.setup.js`, mais ce fichier est en .js
// et `tsconfig.json` n'inclut que .ts/.tsx : `tsc --noEmit` ne le voyait donc pas
// et signalait « Property 'toBeInTheDocument' does not exist » sur chaque
// assertion des tests de composants.
import "@testing-library/jest-dom";
