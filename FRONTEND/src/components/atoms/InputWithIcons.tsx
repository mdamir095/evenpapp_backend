import { Mail } from "lucide-react";

export default function InputWithIcon() {
  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <Mail size={20} />
      </span>
      <input
        type="email"
        placeholder="Enter your email"
        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
      />
    </div>
  );
}
