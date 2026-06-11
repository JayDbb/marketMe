import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function TermsPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden font-sans bg-[#0a0a14]">
      <Navbar />

      {/* Deep space background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,90,200,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 pt-32 pb-24 w-full max-w-4xl mx-auto">
        <div className="w-full bg-white/4 border border-white/8 backdrop-blur-xl p-10 md:p-16 rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.05)] text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tighter mb-8 border-b border-white/10 pb-6">
            Terms of Service
          </h1>
          <div className="space-y-6 text-white/60 font-light leading-relaxed text-sm">
            <p>
              By using our Services, you are agreeing to these terms. Please read them carefully.
            </p>
            <h3 className="text-lg text-white font-serif mt-8 mb-3">1. Using our Services</h3>
            <p>
              You must follow any policies made available to you within the Services. Do not misuse our Services. For example, do not interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.
            </p>
            <h3 className="text-lg text-white font-serif mt-8 mb-3">2. Your Content</h3>
            <p>
              Some of our Services allow you to upload, submit, store, send or receive content. You retain ownership of any intellectual property rights that you hold in that content. In short, what belongs to you stays yours.
            </p>
            <h3 className="text-lg text-white font-serif mt-8 mb-3">3. Liability</h3>
            <p>
              When permitted by law, Marketme will not be responsible for lost profits, revenues, or data, financial losses or indirect, special, consequential, exemplary, or punitive damages.
            </p>
            <p className="mt-12 text-white/30 text-xs italic">
              Last updated: June 2026. This is a placeholder for demonstration purposes.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
