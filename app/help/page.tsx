import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans bg-[#0a0a14]">
      <Navbar />

      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,90,200,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-size-[32px_32px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-4xl mx-auto">
        <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-12 md:p-20 rounded-3xl text-center shadow-[0_0_80px_rgba(59,130,246,0.05)]">
          <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-tighter mb-6">
            How can we <span className="text-blue-400 italic">help?</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed font-light mb-10">
            Whether you are looking for API documentation, trying to set up your content pipelines, or need billing support, our team is ready.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <h3 className="text-white font-serif text-xl mb-2">Technical Support</h3>
              <p className="text-white/40 text-sm mb-6">Help with webhooks, native integrations, and routing logic.</p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full">Contact Engineering</Button>
            </div>
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <h3 className="text-white font-serif text-xl mb-2">Billing & Account</h3>
              <p className="text-white/40 text-sm mb-6">Manage invoices, upgrade your seat capacity, and more.</p>
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 rounded-full">Go to Billing Portal</Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
