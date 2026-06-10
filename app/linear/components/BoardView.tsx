"use client";

import React, { useState } from "react";
import { LinearIssue, LinearState } from "../utils/mockData";
import { PriorityIcon } from "./Icons";

interface BoardViewProps {
  issues: LinearIssue[];
  states: LinearState[];
  onUpdateIssueState: (issueId: string, stateId: string) => void;
  onUpdateIssuePriority: (issueId: string, priority: number) => void;
}

export default function BoardView({
  issues,
  states,
  onUpdateIssueState,
  onUpdateIssuePriority,
}: BoardViewProps) {
  const [activeDropdown, setActiveDropdown] = useState<{ type: 'state' | 'priority', id: string } | null>(null);

  // Focus only on the core workflow states
  const columns = states.filter(s => s.type !== "canceled");

  const getIssuesForState = (stateId: string) => {
    return issues.filter((issue) => issue.state.id === stateId);
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 4: return "Urgent";
      case 3: return "High";
      case 2: return "Medium";
      case 1: return "Low";
      default: return "No Priority";
    }
  };

  const toggleDropdown = (type: 'state' | 'priority', id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDropdown && activeDropdown.type === type && activeDropdown.id === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown({ type, id });
    }
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  React.useEffect(() => {
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4 items-start w-full" onClick={closeDropdown}>
      {columns.map((column) => {
        const columnIssues = getIssuesForState(column.id);
        
        return (
          <div key={column.id} className="flex flex-col gap-4 min-h-[500px]">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {column.name}
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md font-medium">
                {columnIssues.length}
              </span>
            </div>

            {/* Column Body / Issue Cards */}
            <div className="flex flex-col gap-3">
              {columnIssues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800/60 rounded-2xl">
                  <span className="text-xs text-zinc-400 font-medium">No issues</span>
                </div>
              ) : (
                columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="group relative flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200/65 dark:border-zinc-800/80 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_24px_-10px_rgba(0,0,0,0.3)] hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 ease-out animate-slide-up"
                  >
                    {/* Title and Identifier */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-mono font-medium text-zinc-400 dark:text-zinc-500">
                        {issue.identifier}
                      </span>
                      <h4 className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition-colors">
                        {issue.title}
                      </h4>
                    </div>

                    {/* Description excerpt */}
                    {issue.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                    )}

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between mt-1 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        {/* State selector dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => toggleDropdown('state', issue.id, e)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg transition-colors border border-transparent active:scale-[0.97]"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: issue.state.color }}
                            />
                            {issue.state.name}
                          </button>
                          
                          {activeDropdown?.type === 'state' && activeDropdown.id === issue.id && (
                            <div className="absolute left-0 mt-1 z-30 w-36 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 animate-fade-in">
                              {states.map((st) => (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => onUpdateIssueState(issue.id, st.id)}
                                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: st.color }}
                                  />
                                  {st.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Priority selector dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => toggleDropdown('priority', issue.id, e)}
                            className="flex items-center justify-center p-1 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg transition-colors border border-transparent active:scale-[0.97]"
                            title={getPriorityLabel(issue.priority)}
                          >
                            <PriorityIcon priority={issue.priority} size={13} />
                          </button>

                          {activeDropdown?.type === 'priority' && activeDropdown.id === issue.id && (
                            <div className="absolute left-0 mt-1 z-30 w-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1 animate-fade-in">
                              {[4, 3, 2, 1, 0].map((pr) => (
                                <button
                                  key={pr}
                                  type="button"
                                  onClick={() => onUpdateIssuePriority(issue.id, pr)}
                                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                >
                                  <PriorityIcon priority={pr} size={12} />
                                  {getPriorityLabel(pr)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Assignee initials badge */}
                      {issue.assignee ? (
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
                          title={issue.assignee.name}
                        >
                          {issue.assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      ) : (
                        <div
                          className="flex items-center justify-center w-5 h-5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400"
                          title="Unassigned"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
