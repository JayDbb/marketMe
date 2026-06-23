'use client'

import { Post } from '@/types/content'
import { motion } from 'framer-motion'

export function DayView({ posts, currentDate }: { posts: Post[], currentDate: Date }) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

  return (
    <div className="flex-1 w-full flex flex-col space-y-4 overflow-y-auto custom-scrollbar pr-4">
      {hours.map((hour) => {
        // Find posts for this exact hour and day
        const hourPosts = posts.filter(p => {
          const pd = new Date(p.scheduled_date);
          return pd.getFullYear() === currentDate.getFullYear() && 
                 pd.getMonth() === currentDate.getMonth() && 
                 pd.getDate() === currentDate.getDate() && 
                 pd.getHours() === hour;
        });
        
        return (
          <div key={hour} className="flex gap-6 min-h-[80px]">
            <div className="w-16 text-right text-[11px] font-medium text-zinc-500 dark:text-white/30 pt-2 shrink-0">
              {hour > 12 ? `${hour - 12} pm` : `${hour} am`}
            </div>
            
            <div className="flex-1 border-t border-zinc-200 dark:border-white/5 pt-2 relative">
              {hourPosts.map((post, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={post.post_id} 
                  className="w-full max-w-2xl bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-2 flex items-center justify-between shadow-lg"
                >
                  <div>
                    <h4 className="text-sm font-bold text-blue-100 capitalize">{post.social_account?.platform || 'Social'} Post</h4>
                    <p className="text-xs text-blue-200/60 mt-1 line-clamp-1">{post.caption}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md">
                    {post.status.replace('_', ' ')}
                  </span>
                </motion.div>
              ))}
              
              {hourPosts.length === 0 && (
                <div className="flex-1 min-h-[4rem] group relative border border-dashed border-zinc-200 dark:border-white/5 rounded-xl hover:bg-white dark:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"></div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
