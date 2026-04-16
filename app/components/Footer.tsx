export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-6 py-3 bg-white border-t border-border-light text-[11px] text-gray-400">
      <span>Copyright &copy; 2023 &ndash; All Rights Reserved.</span>
      <div className="flex items-center gap-3">
        <span className="hover:text-gray-600 cursor-pointer">Internal Linking</span>
        <span className="text-gray-300">|</span>
        <span className="hover:text-gray-600 cursor-pointer">Sitemaps</span>
        <span className="text-gray-300">|</span>
        <span className="hover:text-gray-600 cursor-pointer">Actions Linkings</span>
      </div>
    </footer>
  );
}
