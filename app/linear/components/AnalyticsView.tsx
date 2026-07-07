"use client";

import React from "react";
import { LinearIssue, LinearTeam, LinearUser } from "../utils/mockData";
import { PriorityIcon } from "./Icons";

interface AnalyticsViewProps {
  issues: LinearIssue[];
  teams: LinearTeam[];
  members: LinearUser[];
}

export default function AnalyticsView({
  issues,
  teams,
  members,
}: AnalyticsViewProps) {
  // Calculations
  const totalIssues = issues.length;
  
  const completedIssues = issues.filter(
    (issue) => issue.state.type === "completed"
  ).length;

  const inProgressIssues = issues.filter(
    (issue) => issue.state.type === "started"
  ).length;

  const backlogIssues = issues.filter(
    (issue) => issue.state.type === "backlog"
  ).length;

  const todoIssues = issues.filter(
    (issue) => issue.state.type === "unstarted"
  ).length;

  const completionRate = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

  // Workload by team
  const teamWorkload = teams.map((team) => {
    const count = issues.filter((issue) => issue.team.id === team.id).length;
    return { name: team.name, key: team.key, count };
  });

  // Priority breakdown
  const priorities = [4, 3, 2, 1, 0];
  const priorityBreakdown = priorities.map((p) => {
    const count = issues.filter((issue) => issue.priority === p).length;
    let label = "No Priority";
    if (p === 4) label = "Urgent";
    if (p === 3) label = "High";
    if (p === 2) label = "Medium";
    if (p === 1) label = "Low";
    return { priority: p, label, count };
  });

  // Assignee workload
  const assigneeWorkload = members.map((member) => {
    const count = issues.filter((issue) => issue.assignee?.id === member.id).length;
    const completed = issues.filter(
      (issue) => issue.assignee?.id === member.id && issue.state.type === "completed"
    ).length;
    const progress = count > 0 ? Math.round((completed / count) * 100) : 0;
    return { member, count, progress };
  });

  const unassignedCount = issues.filter((issue) => !issue.assignee).length;

  // SVG Gauge variables
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Metrics Row (4 Columns Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total issues */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            Total Issues
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 font-mono">
            {totalIssues}
          </h3>
        </div>

        {/* In progress */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            In Progress
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 font-mono">
            {inProgressIssues}
          </h3>
        </div>

        {/* Backlog & Todo */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            Todo / Backlog
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 font-mono">
            {todoIssues + backlogIssues}
          </h3>
        </div>

        {/* Completion rate */}
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
            Completion Rate
          </span>
          <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-1 font-mono">
            {completionRate}%
          </h3>
        </div>
      </div>

      {/* Main Analytics Content (Split Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Progress Circular Gauge Card */}
        <div className="md:col-span-1 p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[2.5rem] flex flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mb-4 self-start">
            Workspace Completion
          </span>
          
          <div className="relative flex items-center justify-center w-36 h-36 mt-2">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-850"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Foreground progress circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-zinc-900 dark:stroke-zinc-50 transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                {completionRate}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider mt-0.5">
                Completed
              </span>
            </div>
          </div>

          <div className="flex gap-4 mt-6 w-full border-t border-zinc-100 dark:border-zinc-800/40 pt-4 text-xs">
            <div className="flex-1 text-center border-r border-zinc-100 dark:border-zinc-800/40">
              <span className="block text-zinc-400 dark:text-zinc-500 font-medium">Done</span>
              <span className="text-base font-bold text-zinc-800 dark:text-zinc-250 font-mono mt-0.5 block">{completedIssues}</span>
            </div>
            <div className="flex-1 text-center">
              <span className="block text-zinc-400 dark:text-zinc-500 font-medium">Active</span>
              <span className="text-base font-bold text-zinc-800 dark:text-zinc-250 font-mono mt-0.5 block">{totalIssues - completedIssues}</span>
            </div>
          </div>
        </div>

        {/* Priority and Team distribution */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Priorities card */}
          <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block mb-4">
              Issues by Priority
            </span>
            <div className="flex flex-col gap-3">
              {priorityBreakdown.map((item) => {
                const percentage = totalIssues > 0 ? (item.count / totalIssues) * 100 : 0;
                return (
                  <div key={item.priority} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-28 text-xs font-medium text-zinc-700 dark:text-zinc-350">
                      <PriorityIcon priority={item.priority} size={14} />
                      <span>{item.label}</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-450 font-medium w-6 text-right">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team and Assignee Load */}
          <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase block mb-4">
              Team & Assignee Workload
            </span>
            {teamWorkload.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {teamWorkload.map((team) => (
                  <span
                    key={team.key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    <span className="font-mono text-zinc-400">{team.key}</span>
                    {team.name}
                    <span className="font-mono text-zinc-500">{team.count}</span>
                  </span>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assigneeWorkload.map((item) => (
                <div
                  key={item.member.id}
                  className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 rounded-2xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-850 text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                      {item.member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-250">
                        {item.member.name}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
                        {item.progress}% completion
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-250 font-mono">
                      {item.count}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                      Issues
                    </span>
                  </div>
                </div>
              ))}

              {/* Unassigned count */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800/40 rounded-2xl border-dashed">
                <div className="flex items-center gap-2 text-zinc-450">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-zinc-350 dark:border-zinc-700 text-zinc-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Unassigned issues</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-250 font-mono">
                    {unassignedCount}
                  </span>
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                    Issues
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
