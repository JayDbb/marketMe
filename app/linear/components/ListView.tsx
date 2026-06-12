"use client";

import React, { useState } from "react";
import { LinearIssue, LinearState } from "../utils/mockData";
import { PriorityIcon, SearchIcon } from "./Icons";

interface ListViewProps {
  issues: LinearIssue[];
  states: LinearState[];
  onUpdateIssueState: (issueId: string, stateId: string) => void;
  onUpdateIssuePriority: (issueId: string, priority: number) => void;
  teams: { id: string; name: string; key: string }[];
}

export default function ListView({
  issues,
  states,
  onUpdateIssueState,
  onUpdateIssuePriority,
  teams,
}: ListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [activeDropdown, setActiveDropdown] = useState<{ type: 'state' | 'priority', id: string } | null>(null);

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

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTeam = selectedTeam === "all" || issue.team.id === selectedTeam;
    
    const matchesPriority =
      selectedPriority === "all" || issue.priority.toString() === selectedPriority;

    return matchesSearch && matchesTeam && matchesPriority;
  });

  return (
    <div className="flex flex-col gap-4 w-full" onClick={closeDropdown}>
      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-2">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            placeholder="Search issues, titles, identifiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-zinc-400 dark:focus:border-zinc-700 focus:outline-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Team Filter */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5 w-1/2 md:w-auto">
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Team
            </span>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full md:w-auto px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <option value="all">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5 w-1/2 md:w-auto">
            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              Priority
            </span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full md:w-auto px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="4">Urgent</option>
              <option value="3">High</option>
              <option value="2">Medium</option>
              <option value="1">Low</option>
              <option value="0">No Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues Table Container */}
      <div className="w-full overflow-hidden border border-zinc-200/70 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
                <th className="py-3.5 px-4 w-24">Identifier</th>
                <th className="py-3.5 px-4 min-w-[200px]">Title</th>
                <th className="py-3.5 px-4 w-32">Team</th>
                <th className="py-3.5 px-4 w-28">Status</th>
                <th className="py-3.5 px-4 w-28">Priority</th>
                <th className="py-3.5 px-4 w-28">Assignee</th>
                <th className="py-3.5 px-4 w-28">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850/40 text-xs">
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-zinc-400 dark:text-zinc-500">
                    No matching issues found
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors animate-slide-up"
                  >
                    {/* Identifier */}
                    <td className="py-3 px-4 font-mono text-zinc-400 dark:text-zinc-500 font-medium">
                      {issue.identifier}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      <div className="flex flex-col gap-0.5">
                        <span>{issue.title}</span>
                        {issue.description && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 line-clamp-1 font-normal">
                            {issue.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 font-medium">
                      {issue.team.name}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => toggleDropdown('state', issue.id, e)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 rounded-lg transition-colors border border-transparent active:scale-[0.97]"
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
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => toggleDropdown('priority', issue.id, e)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 rounded-lg transition-colors border border-transparent active:scale-[0.97]"
                        >
                          <PriorityIcon priority={issue.priority} size={12} />
                          {getPriorityLabel(issue.priority)}
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
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4">
                      {issue.assignee ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
                            {issue.assignee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                            {issue.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600 text-[11px] font-medium">Unassigned</span>
                      )}
                    </td>

                    {/* Updated Time */}
                    <td className="py-3 px-4 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                      {new Date(issue.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
