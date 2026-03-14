export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <p className="font-serif italic text-lg tracking-wide text-[#F59E0B]/80">
          &ldquo;Every moment of your life deserves its own music.&rdquo;
        </p>

        <div className="space-y-2">
          <p className="text-sm text-[#8B7E6A]">
            <span className="font-serif tracking-wide">HARMONY</span>
            {" "}&mdash; A Vilmure Ventures Company
          </p>
          <p className="text-xs text-[#8B7E6A]/60">
            Built with love by humans and AI
          </p>
        </div>
      </div>
    </footer>
  );
}
