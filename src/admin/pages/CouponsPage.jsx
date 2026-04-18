import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Ticket, Plus, Trash2, Search, Calendar, 
  Percent, ArrowRight, CheckCircle2, Clock, 
  AlertCircle, X
} from "lucide-react";
import { apiFetch } from "@/utils/api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    discount_percent: "",
    max_discount: "",
    min_order_value: "",
    max_usage: "",
    valid_until: ""
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await apiFetch('/api/coupons');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons);
        }
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/coupons', {
        method: 'POST',
        body: JSON.stringify(newCoupon)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons([data.coupon, ...coupons]);
        setShowModal(false);
        setNewCoupon({
          code: "",
          type: "percentage",
          discount_percent: "",
          max_discount: "",
          min_order_value: "",
          max_usage: "",
          valid_until: ""
        });
      } else {
        alert(data.message || "Error creating coupon");
      }
    } catch (err) {
      alert("Error creating coupon");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await apiFetch(`/api/coupons/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCoupons(coupons.filter(c => c.coupon_id !== id));
      }
    } catch (err) {
      alert("Error deleting coupon");
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coupon Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount codes for your customers</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Coupon
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Coupons</p>
              <p className="text-2xl font-bold">{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Now</p>
              <p className="text-2xl font-bold">{coupons.filter(c => c.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Recently Used</p>
              <p className="text-2xl font-bold">{coupons.reduce((sum, c) => sum + (c.used_count || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-secondary/5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by code..." 
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/20 text-muted-foreground border-b uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-3 text-left">Coupon Details</th>
                <th className="px-6 py-3 text-left">Discount</th>
                <th className="px-6 py-3 text-left">Min. Order</th>
                <th className="px-6 py-3 text-left">Usage</th>
                <th className="px-6 py-3 text-left">Expiry</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 bg-secondary/5"></td>
                  </tr>
                ))
              ) : filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.coupon_id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground tracking-tight">{coupon.code}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{coupon.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-success font-bold">
                        <Percent className="w-4 h-4" />
                        <span>{coupon.discount_percent}%</span>
                        {coupon.max_discount && (
                          <span className="text-[10px] text-muted-foreground font-normal">(Up to ₹{coupon.max_discount})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      ₹{coupon.min_order_value || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                          <span>USED: {coupon.used_count || 0}</span>
                          {coupon.max_usage && <span>LIMIT: {coupon.max_usage}</span>}
                        </div>
                        <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${coupon.max_usage ? (coupon.used_count / coupon.max_usage) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.valid_until ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(coupon.valid_until).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No Expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteCoupon(coupon.coupon_id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Ticket className="w-10 h-10 opacity-20" />
                      <p>No coupons found. Create your first one to get started!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Create New Coupon</h2>
                <p className="text-sm text-muted-foreground">Define your discount rule and validity</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Coupon Code</label>
                  <Input 
                    required 
                    placeholder="e.g. WELCOME20" 
                    className="h-10 font-bold tracking-wider"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Discount (%)</label>
                  <Input 
                    required 
                    type="number" 
                    placeholder="20"
                    value={newCoupon.discount_percent}
                    onChange={(e) => setNewCoupon({...newCoupon, discount_percent: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Max Discount (₹)</label>
                  <Input 
                    type="number" 
                    placeholder="500"
                    value={newCoupon.max_discount}
                    onChange={(e) => setNewCoupon({...newCoupon, max_discount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Min Order (₹)</label>
                  <Input 
                    required 
                    type="number" 
                    placeholder="999"
                    value={newCoupon.min_order_value}
                    onChange={(e) => setNewCoupon({...newCoupon, min_order_value: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Valid Until</label>
                  <Input 
                    type="date" 
                    value={newCoupon.valid_until}
                    onChange={(e) => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5 ml-1">Max Use Count</label>
                  <Input 
                    type="number" 
                    placeholder="100"
                    value={newCoupon.max_usage}
                    onChange={(e) => setNewCoupon({...newCoupon, max_usage: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground">Create Coupon</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
