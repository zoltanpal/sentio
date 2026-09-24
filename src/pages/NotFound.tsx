import { Link } from "react-router-dom";

export default function NotFound() {
    return (
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground">The page you are looking for does not exist.</p>
        <p className="mt-5 text-center"><Link to="/dashboard" className="text-2m text-blue-500 hover:text-teal-700">Back to Dashboard</Link></p>
      </div>
    );
  }