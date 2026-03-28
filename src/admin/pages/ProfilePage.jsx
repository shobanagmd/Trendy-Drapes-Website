import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, Edit, Camera } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Admin Director",
    email: "admin@shopvault.com",
    phone: "+91 98765-43210",
    role: "Super Admin",
    address: "Tower A, Business Park, Andheri East, Mumbai 400069",
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    // Load profile from localStorage on mount
    const savedProfile = localStorage.getItem("adminProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setFormData(parsed);
      setOriginalData(parsed);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalData(formData);
  };

  const handleSaveChanges = () => {
    // Save to localStorage
    localStorage.setItem("adminProfile", JSON.stringify(formData));
    alert("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your admin account and preferences</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">AD</div>
            <button className="absolute bottom-0 right-0 rounded-full bg-card border p-1.5 shadow-sm hover:bg-secondary transition-colors">
              <Camera className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
          <h3 className="text-base font-semibold text-card-foreground">Admin Director</h3>
          <p className="text-xs text-muted-foreground">Super Admin · ShopVault</p>
          <div className="mt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2"><Mail className="h-3.5 w-3.5" />{formData.email}</div>
            <div className="flex items-center justify-center gap-2"><Phone className="h-3.5 w-3.5" />{formData.phone}</div>
            <div className="flex items-center justify-center gap-2"><MapPin className="h-3.5 w-3.5" />Mumbai, Maharashtra</div>
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-center">
            <div><p className="text-lg font-bold text-card-foreground">342</p><p className="text-[10px] text-muted-foreground">Sellers</p></div>
            <div><p className="text-lg font-bold text-card-foreground">12.8K</p><p className="text-[10px] text-muted-foreground">Products</p></div>
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-card-foreground">Personal Information</h3>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" size="sm" className="text-xs"><Edit className="h-3.5 w-3.5 mr-1.5" />Edit</Button>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="text-xs font-medium text-card-foreground block mb-1">Full Name</label><Input name="fullName" value={formData.fullName} onChange={handleChange} disabled={!isEditing} className={!isEditing ? "bg-secondary border-none text-sm" : "text-sm"} /></div>
            <div><label className="text-xs font-medium text-card-foreground block mb-1">Email</label><Input name="email" value={formData.email} onChange={handleChange} disabled={!isEditing} className={!isEditing ? "bg-secondary border-none text-sm" : "text-sm"} /></div>
            <div><label className="text-xs font-medium text-card-foreground block mb-1">Phone</label><Input name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} className={!isEditing ? "bg-secondary border-none text-sm" : "text-sm"} /></div>
            <div><label className="text-xs font-medium text-card-foreground block mb-1">Role</label><Input name="role" value={formData.role} disabled className="bg-secondary border-none text-sm" /></div>
            <div className="sm:col-span-2"><label className="text-xs font-medium text-card-foreground block mb-1">Company Address</label><Input name="address" value={formData.address} onChange={handleChange} disabled={!isEditing} className={!isEditing ? "bg-secondary border-none text-sm" : "text-sm"} /></div>
          </div>
          {isEditing && (
            <div className="mt-5 flex gap-2">
              <Button onClick={handleSaveChanges} size="sm">Save Changes</Button>
              <Button onClick={handleCancel} variant="outline" size="sm">Cancel</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
