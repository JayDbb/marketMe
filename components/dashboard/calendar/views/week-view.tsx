'use client'

import { Post } from '@/types/content'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Download } from 'lucide-react'

interface WeekViewProps {
  posts: Post[];
  currentDate: Date;
}

export function WeekView({ posts, currentDate }: WeekViewProps) {
  // Generate 12 hours for the Y-axis (e.g., 6 AM to 5 PM)
  const hours = Array.from({ length: 12 }, (_, i) => i + 6);
  
  // Generate the 7 days of the week starting from Sunday
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Helper to map a date to CSS Grid coordinates
  // Columns: 1 (Time label), 2 (Sun) -> 8 (Sat)
  const getGridColumn = (date: string) => {
    const d = new Date(date);
    return d.getDay() + 2; 
  };

  // Rows: 1 (Header), 2 (6am) -> 13 (5pm)
  // Each hour block can be split into fractions, but for simple MVP we'll snap to hour
  const getGridRowStart = (date: string) => {
    const d = new Date(date);
    const hour = d.getHours();
    const row = (hour - 6) + 1; // 6am = row 1
    return Math.max(1, Math.min(row, hours.length)); // clamp
  };

  // Some mock hardcoded aesthetic blocks for the screenshot vibe since our DB `posts` 
  // only have a single `scheduled_at` timestamp, not a duration.
  // We will map our real `posts` and assign them random colorful card styles.
  const colorSchemes = [
    'bg-blue-300 text-blue-900 border-blue-400/20',
    'bg-green-300 text-green-900 border-green-400/20',
    'bg-purple-300 text-purple-900 border-purple-400/20',
    'bg-yellow-300 text-yellow-900 border-yellow-400/20',
    'bg-pink-300 text-pink-900 border-pink-400/20',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Sticky Header for Days */}
      <div className="flex pl-[60px] pb-4 mb-4 border-b border-zinc-200 dark:border-white/5 shrink-0 pr-4">
        {weekDays.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-white/5 border-transparent mx-1 py-3 rounded-2xl border dark:border-white/5">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-white/40 uppercase tracking-wider mb-1">
              {d.toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
            <span className={`text-2xl font-bold tracking-tighter ${d.getDate() === new Date().getDate() ? 'text-purple-400' : 'text-zinc-900 dark:text-white'}`}>
              {d.getDate()}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Timeline */}
      <div className="flex-1 overflow-auto custom-scrollbar pr-2 pb-10">
        <div 
          className="min-w-[800px] w-full grid gap-2 relative" 
          style={{ 
            gridTemplateColumns: '60px repeat(7, minmax(120px, 1fr))',
            gridAutoRows: 'minmax(80px, auto)'
          }}
        >
          {/* Horizontal Grid Lines */}
          {hours.map((hour, idx) => (
            <div 
              key={`line-${hour}`} 
              className="col-span-8 border-t border-zinc-200 dark:border-white/5 pointer-events-none"
              style={{ gridRow: idx + 1 }}
            />
          ))}

        {/* Time Labels (Y-Axis) */}
        {hours.map((hour, idx) => (
          <div 
            key={`time-${hour}`} 
            className="text-[11px] font-medium text-zinc-500 dark:text-white/30 pt-2 text-right pr-4"
            style={{ gridColumn: 1, gridRow: idx + 1 }}
          >
            {hour > 12 ? `${hour - 12} pm` : `${hour} am`}
          </div>
        ))}

        {/* Dynamic Event Blocks */}
        {posts.map((post, idx) => {
          const col = getGridColumn(post.scheduled_date);
          const rowStart = getGridRowStart(post.scheduled_date);
          // For aesthetic purposes, we randomly assign a height of 1 to 3 hours to events
          const idNum = typeof post.post_id === 'number' ? post.post_id : String(post.post_id).charCodeAt(0);
          const duration = Math.max(1, (idNum % 3) + 1);
          const colors = colorSchemes[idNum % colorSchemes.length];
          const platform = post.social_account?.platform || 'Social';

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={post.post_id}
              className={`rounded-2xl p-3 flex flex-col border shadow-xl overflow-hidden relative cursor-pointer hover:brightness-110 transition-all ${colors}`}
              style={{
                gridColumn: col,
                gridRow: `${rowStart} / span ${duration}`
              }}
            >
              <h4 className="text-xs font-bold leading-tight mb-1 capitalize">
                {platform} Post
              </h4>
              <p className="text-[10px] font-medium opacity-60">
                {new Date(post.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                {' - '}
                {new Date(new Date(post.scheduled_date).getTime() + duration * 60*60*1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              
              <div className="mt-auto pt-2 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white dark:bg-white/20 border border-transparent flex items-center justify-center text-[10px] font-bold">M</div>
                </div>
                {post.media_url ? (
                  <button className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors">
                    <Download className="w-3 h-3" />
                  </button>
                ) : null}
              </div>

              {/* Decorative background element if event is tall enough */}
              {duration > 1 && post.media_url && (
                <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${post.media_url})` }} />
              )}
            </motion.div>
          )
        })}

        {/* Add an empty placeholder slot to match the screenshot vibe */}
        <div 
          className="rounded-2xl border-2 border-dashed border-transparent dark:border-white/20 bg-white dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-white/10 transition-colors"
          style={{ gridColumn: 4, gridRow: '2 / span 2' }}
        >
          <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/30 flex items-center justify-center text-zinc-500 dark:text-white/50">
            +
          </div>
        </div>

      </div>
    </div>
    </div>
  )
}
