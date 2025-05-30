'use client';

import { useState } from 'react';

export default function QuickActionsPanel() {
  const handleAddContact = () => {
    window.location.href = '/contacts?action=add';
  };

  const handleMakeIntro = () => {
    window.location.href = '/introductions';
  };

  const handleLogInteraction = () => {
    window.location.href = '/contacts?action=log';
  };

  return (
    <div className="card-mobile border-accent/20 hover:border-accent/40 transition-all duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="heading-md-mobile text-text">Neural Commands</h2>
          <div className="w-2 h-2 bg-accent rounded-full pulse-hive"></div>
        </div>
        <div className="w-6 h-6 bg-accent/20 rounded-hive flex items-center justify-center">
          <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleAddContact}
          className="card-node group p-4 text-center hover:shadow-glow hover:border-accent/40"
        >
          <div className="w-10 h-10 bg-accent/20 rounded-hive flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/30 group-active:scale-95 transition-all duration-200">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-text text-xs mb-1">Add Node</h3>
          <p className="text-xs text-subtle leading-tight">Expand network</p>
        </button>

        <button
          onClick={handleMakeIntro}
          className="card-node group p-4 text-center hover:shadow-glow-accent2 hover:border-accent2/40"
        >
          <div className="w-10 h-10 bg-accent2/20 rounded-hive flex items-center justify-center mx-auto mb-2 group-hover:bg-accent2/30 group-active:scale-95 transition-all duration-200">
            <svg
              className="w-5 h-5 text-accent2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-text text-xs mb-1">Bridge</h3>
          <p className="text-xs text-subtle leading-tight">Connect nodes</p>
        </button>

        <button
          onClick={handleLogInteraction}
          className="card-node group p-4 text-center hover:shadow-glow hover:border-accent/40"
        >
          <div className="w-10 h-10 bg-accent/20 rounded-hive flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/30 group-active:scale-95 transition-all duration-200">
            <svg
              className="w-5 h-5 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-text text-xs mb-1">Log Signal</h3>
          <p className="text-xs text-subtle leading-tight">Record data</p>
        </button>
      </div>
    </div>
  );
}