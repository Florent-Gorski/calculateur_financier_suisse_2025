import React from "react";
import { AvsStep } from "./components/Wizard/AvsStep";

export default function App()
{
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Calculateur Financier Suisse 2025 – AVS (démo)
        </h1>
        <AvsStep />
      </div>
    </div>
  );
}
