import { Pencil, Upload } from "lucide-react";

export default function ProfileForm() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow border space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>

      {/* Avatar and Upload */}
      <div className="flex items-center space-x-4">
        <img
          src="https://i.pravatar.cc/100"
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover"
        />
        <label className="flex items-center space-x-2 cursor-pointer text-sm text-blue-600 hover:underline">
          <Upload className="w-4 h-4" />
          <span>Change Picture</span>
          <input type="file" className="hidden" />
        </label>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            defaultValue="Cameron"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            defaultValue="Williamson"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            defaultValue="Cameron"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <input
            type="text"
            defaultValue="Male"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Birthday</label>
          <input
            type="text"
            defaultValue="23 Desember 2003"
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center space-x-4 pt-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Update
        </button>
        <button className="text-sm text-gray-600 hover:underline">Cancel</button>
      </div>

      {/* Optional: Contact Detail Placeholder */}
      <div className="pt-6 border-t">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Contact Detail</h2>
          <button className="flex items-center text-sm text-gray-600 hover:text-blue-600">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
