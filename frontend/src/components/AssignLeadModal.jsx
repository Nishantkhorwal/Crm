import { Dialog } from "@headlessui/react";
import { X, UserCheck, UserX } from "lucide-react";
import { useState } from "react";

const AssignLeadModal = ({ isOpen, onClose, leadId, users, currentAssignedTo, token, onSuccess }) => {
  const [selectedUser, setSelectedUser] = useState(currentAssignedTo || "");

  const handleAssign = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ leadId, userId: selectedUser }),
    });

    if (res.ok) {
      onSuccess?.();
      onClose();
    } else {
      alert("Failed to assign lead.");
    }
  };

  const handleUnassign = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/client/unassign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ leadId }),
    });

    if (res.ok) {
      onSuccess?.();
      onClose();
    } else {
      alert("Failed to unassign lead.");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-xl max-w-md w-full shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Assign Lead</h3>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-500 hover:text-black" />
            </button>
          </div>

          <select
            className="w-full border rounded-md px-3 py-2 mb-4"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            disabled={!selectedUser}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md flex justify-center items-center space-x-2 ${
              !selectedUser ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Lead</span>
          </button>

          {currentAssignedTo && (
            <button
              onClick={handleUnassign}
              className="mt-3 w-full bg-red-100 hover:bg-red-200 text-red-700 font-medium px-4 py-2 rounded-md flex justify-center items-center space-x-2"
            >
              <UserX className="w-4 h-4" />
              <span>Unassign Lead</span>
            </button>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AssignLeadModal;
