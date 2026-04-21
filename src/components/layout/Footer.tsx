import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-2 text-sm text-gray-600 sm:flex-row sm:justify-center">
          
          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <Link to="/help" className="hover:underline">
              How it works
            </Link>
            <Link to="/sources" className="hover:underline">
              Sources
            </Link>
            <Link to="/about" className="hover:underline">
              About
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
            {/* <Link to="/privacy" className="hover:underline">
              Privacy
            </Link> */}
          </div>
          |
          <div className="text-center sm:text-right text-gray-500">
            &copy; {new Date().getFullYear()} Sentio
          </div>
        </div>
      </div>
    </footer>
  );
}
