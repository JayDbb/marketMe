"use client";

import React, { useState } from "react";
import { LinearTeam, LinearUser } from "../utils/mockData";

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: LinearTeam[];
  members: LinearUser[];
  onSubmit: (issueData: {
    title: string;
    description: string;
    teamId: string;
    stateId: string;
    priority: number;
    assigneeId?: string;
  }) => Promise<void>;
}

export default function CreateIssueModal({
  isOpen,
  onClose,
  teams,
  members,
  onSubmit,
}: CreateIssueModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<number>(0);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedTeamId = selectedTeamId || teams[0]?.id || "";
  const activeTeam = teams.find((t) => t.id === resolvedTeamId);
  const availableStates = activeTeam ? activeTeam.states : [];
  const resolvedStateId =
    selectedStateId ||
    availableStates.find((s) => s.type === "unstarted")?.id ||
    availableStates[0]?.id ||
    "";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Issue title is required.");
      return;
    }
    if (!resolvedTeamId || !resolvedStateId) {
      setError("Select a team and status.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        teamId: resolvedTeamId,
        stateId: resolvedStateId,
        priority: selectedPriority,
        assigneeId: selectedAssigneeId || undefined,
      });

      setTitle("");
      setDescription("");
      setSelectedPriority(0);
      setSelectedAssigneeId("");
      setSelectedTeamId("");
      setSelectedStateId("");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create issue. Please check fields.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-zinc-950/40 dark:bg-zinc-950/70 backdrop-blur-[4px] transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] p-8 md:p-10 z-10 transform-origin-center animate-slide-up flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/50">
          <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create new issue
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-lg transition-colors active:scale-[0.95]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="issue-title"
              className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
            >
              Title
            </label>
            <input
              id="issue-title"
              type="text"
              required
              placeholder="e.g. Implement webhook dispatch logic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-zinc-400 dark:focus:border-zinc-700 focus:outline-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="issue-description"
              className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
            >
              Description
            </label>
            <textarea
              id="issue-description"
              placeholder="Include details, context, and validation criteria..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-zinc-400 dark:focus:border-zinc-700 focus:outline-none transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-800 dark:text-zinc-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="issue-team"
                className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
              >
                Team
              </label>
              <select
                id="issue-team"
                value={resolvedTeamId}
                onChange={(e) => {
                  setSelectedTeamId(e.target.value);
                  setSelectedStateId("");
                }}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="issue-status"
                className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
              >
                Status
              </label>
              <select
                id="issue-status"
                value={resolvedStateId}
                onChange={(e) => setSelectedStateId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                {availableStates.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="issue-priority"
                className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
              >
                Priority
              </label>
              <select
                id="issue-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                <option value={0}>No Priority</option>
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
                <option value={4}>Urgent</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="issue-assignee"
                className="text-[11px] font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase"
              >
                Assignee
              </label>
              <select
                id="issue-assignee"
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            {error && (
              <span className="text-[11px] text-red-500 font-medium mr-auto">
                {error}
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 rounded-xl transition-colors active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-850 dark:hover:bg-zinc-200 text-zinc-950 rounded-xl dark:text-zinc-950 transition-colors shadow-sm disabled:opacity-50 active-press active:scale-[0.97]"
            >
              {isSubmitting ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
