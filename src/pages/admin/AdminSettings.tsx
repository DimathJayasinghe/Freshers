import { Button } from "@/components/ui/button";
import AdminCard from "@/components/AdminCard";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSettings() {
  const navigate = useNavigate();
  return (
    <AdminLayout title="Admin — System Settings">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Admin — System Settings</h2>
          <Button variant="ghost" onClick={() => navigate('/admin')}>Back</Button>
        </div>

        <AdminCard>
          <div className="mb-2 text-lg font-semibold text-white">System Settings</div>
          <div>
            <p className="text-sm text-gray-400">Placeholder for global configuration and feature toggles.</p>
          </div>
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
