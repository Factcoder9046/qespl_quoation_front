'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { X, ShieldCheck } from 'lucide-react';
import { userAPI } from '@/lib/api';

export default function PermissionsModal({ user, onClose, onUpdated }) {
  const [permissions, setPermissions] = useState(
    user.permissions?.quotation || {
      create: false,
      read: true,
      update: false,
      delete: false,
    }
  );

  const toggle = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const savePermissions = async () => {
    try {
      await userAPI.updatePermissions(user._id, {
        quotation: permissions
      });

      toast.success('Permissions updated');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update permissions'
      );
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#007d58]" />
            <h2 className="text-lg font-semibold">Quotation Permissions</h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* User */}
        <p className="text-sm text-gray-600 mb-4">
          Managing permissions for <b>{user.name}</b>
        </p>

        {/* Checkboxes */}
        <div className="space-y-3">
          {['create', 'read', 'update', 'delete'].map((perm) => (
            <label
              key={perm}
              className="flex items-center justify-between border rounded-xl p-3 cursor-pointer"
            >
              <span className="capitalize font-medium">{perm}</span>
              <input
                type="checkbox"
                checked={permissions[perm]}
                onChange={() => toggle(perm)}
                className="w-5 h-5 accent-[#007d58]"
              />
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={savePermissions}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
