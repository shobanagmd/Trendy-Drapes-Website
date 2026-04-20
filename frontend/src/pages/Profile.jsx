import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/utils/api";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { BACKEND_URL } from "@/utils/paths";

const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
};

// Use lucide-react for icons
import { 
  User as UserLucide, 
  Package as PackageLucide, 
  Heart as HeartLucide, 
  MapPin as MapPinLucide, 
  LogOut as LogOutLucide, 
  LayoutDashboard as LayoutDashboardLucide, 
  ChevronRight as ChevronRightLucide, 
  Save as SaveLucide, 
  ShieldCheck as ShieldCheckLucide, 
  Mail as MailLucide, 
  Phone as PhoneLucide, 
  CreditCard as CreditCardLucide, 
  ChevronLeft as ChevronLeftLucide,
  Camera,
  Download,
  RotateCcw,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  Trash2,
  Plus as PlusIcon,
  Pencil
} from "lucide-react";

const Profile = () => {
  const { user, role, logout, setUser } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [activeView, setActiveView] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    profile_picture_url: "",
    date_of_birth: "",
    gender: ""
  });
  
  const [addresses, setAddresses] = useState([]);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    full_name: "", phone: "", address_line_1: "", address_line_2: "", 
    city: "", state: "", pincode: "", country: "India", address_type: "Home", is_default: false
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      setProfileData({
        full_name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
        country: user.country || "India",
        profile_picture_url: user.profile_picture_url || user.profile_image || "",
        date_of_birth: user.date_of_birth || "",
        gender: user.gender || ""
      });
      hasInitialized.current = true;
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch("/api/user/me");
      if (res.ok) {
        const data = await res.json();
        setProfileData(prev => ({ ...prev, ...data.user }));
        setUser({ ...user, ...data.user });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/user/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/orders/my-orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else {
        console.error("Failed to fetch orders:", res.status);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const url = selectedAddress ? `/api/user/addresses/${selectedAddress.address_id}` : "/api/user/addresses";
      const method = selectedAddress ? "PUT" : "POST";
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(addressForm)
      });
      
      if (res.ok) {
        toast.success(selectedAddress ? "Address updated" : "Address added");
        setIsEditingAddress(false);
        setSelectedAddress(null);
        fetchAddresses();
      } else {
        toast.error("Failed to save address");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await apiFetch(`/api/user/addresses/${addressId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Address deleted");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleEditAddress = (addr) => {
    setSelectedAddress(addr);
    setAddressForm({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line_1: addr.address_line_1,
      address_line_2: addr.address_line_2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      address_type: addr.address_type,
      is_default: addr.is_default
    });
    setIsEditingAddress(true);
  };

  const handleAddNewAddress = () => {
    setSelectedAddress(null);
    setAddressForm({
      full_name: profileData.full_name || "",
      phone: profileData.phone || "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      address_type: "Home",
      is_default: addresses.length === 0
    });
    setIsEditingAddress(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiFetch("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const data = await res.json();
        toast.success("Profile updated successfully");
        setUser({ ...user, ...data.user });
        if (activeView === "profile" || activeView === "addresses") {
          setActiveView("overview");
        }
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      setUploading(true);
      const res = await fetch("/api/user/profile-photo", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setProfileData(prev => ({ ...prev, profile_picture_url: data.profileImage }));
        setUser({ ...user, profile_picture_url: data.profileImage });
        toast.success("Profile photo updated");
      } else {
        toast.error(data.message || "Upload failed");
      }
    } catch (err) {
      toast.error("Error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Order ${newStatus.toLowerCase()} successfully`);
        fetchOrders(); // Refresh list
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleReorder = (order) => {
    if (!order.items) return;
    order.items.forEach(item => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        price: Number(item.price),
        quantity: item.quantity,
        size: "Free Size" // Default
      });
    });
    toast.success("All items added to cart!");
    navigate("/cart");
  };

  const handleDownloadInvoice = (orderId) => {
      // In a real app, this would be a PDF generation endpoint
      // For now we'll just show a toast
      toast.info("Invoice generation is being processed. It will be downloaded shortly.");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "orders", icon: PackageLucide, label: "My Orders", desc: "Track, return or buy again", action: () => { setActiveView("orders"); fetchOrders(); } },
    { id: "cart", icon: CreditCardLucide, label: "My Cart", desc: "View and manage your shopping cart", link: "/cart" },
    { id: "wishlist", icon: HeartLucide, label: "Wishlist", desc: "Your saved items", link: "/wishlist" },
    { id: "addresses", icon: MapPinLucide, label: "Addresses", desc: "Manage your delivery addresses", action: () => { setActiveView("addresses"); fetchAddresses(); } },
    { id: "profile", icon: UserLucide, label: "Profile Details", desc: "Edit your personal information", action: () => setActiveView("profile") },
  ];

  if (role === "admin") {
    menuItems.unshift({ id: "admin", icon: LayoutDashboardLucide, label: "Admin Dashboard", desc: "Manage store and products", link: "/admin" });
  } else if (role === "seller") {
    menuItems.unshift({ id: "seller", icon: LayoutDashboardLucide, label: "Seller Dashboard", desc: "Manage your seller account", link: "/seller/dashboard" });
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return <Clock className="text-yellow-500" size={16} />;
      case "shipped": return <Truck className="text-blue-500" size={16} />;
      case "delivered": return <CheckCircle2 className="text-green-500" size={16} />;
      case "cancelled": return <XCircle className="text-red-500" size={16} />;
      default: return <PackageLucide className="text-gray-400" size={16} />;
    }
  };

  const getStatusStep = (status) => {
    const steps = ["Pending", "Processing", "Shipped", "Delivered"];
    const currentIdx = steps.indexOf(status) !== -1 ? steps.indexOf(status) : 0;
    return currentIdx;
  };

  const renderView = () => {
    switch (activeView) {
      case "orders":
        if (selectedOrder) {
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-4 cursor-pointer hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]" onClick={() => setSelectedOrder(null)}>
                <ChevronLeftLucide size={14} /> Back to My Orders
              </div>
              
              <div className="flex flex-wrap justify-between items-end gap-4 border-b border-border pb-6">
                <div>
                  <h3 className="text-3xl font-display font-bold">Order Details</h3>
                  <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(selectedOrder.created_at).toLocaleDateString()} at {new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => handleDownloadInvoice(selectedOrder.order_id)} className="px-4 py-2 border border-border rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors flex items-center gap-2">
                     <Download size={14} /> Invoice
                   </button>
                   <button onClick={() => handleReorder(selectedOrder)} className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                     <RotateCcw size={14} /> Reorder
                   </button>
                </div>
              </div>

              {/* Status Tracker */}
              {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Returned" && (
                <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
                  <div className="flex justify-between mb-8">
                     {["Order Placed", "Confirmed", "Shipped", "Delivered"].map((step, idx) => {
                        const currentStep = getStatusStep(selectedOrder.status);
                        const isCompleted = idx <= currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <div key={step} className="flex flex-col items-center gap-4 flex-1 relative">
                             {/* Line */}
                             {idx < 3 && (
                               <div className={`absolute top-5 left-[50%] w-full h-1 ${idx < currentStep ? "bg-primary" : "bg-secondary"}`}></div>
                             )}
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${isCompleted ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-secondary text-muted-foreground"}`}>
                                {isCompleted ? <CheckCircle2 size={20} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                             </div>
                             <span className={`text-[10px] font-bold uppercase tracking-widest text-center ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>{step}</span>
                          </div>
                        )
                     })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4">Items Summary</h4>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-5 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                        <div className="w-16 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                           {item.product_image ? (
                             <img 
                               src={formatImageUrl(item.product_image)} 
                               alt={item.product_name}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-muted-foreground"><PackageLucide size={20} /></div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-6 md:mt-8">
                   <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary">Shipping Address</h4>
                      <p className="text-sm font-medium">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}<br />
                        {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}<br />
                        {selectedOrder.shipping_address?.country}
                      </p>
                      <p className="text-sm font-medium mt-4">Phone: {selectedOrder.customer_phone}</p>
                   </div>

                   <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary">Price Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground font-medium">
                          <span>Subtotal</span>
                          <span>₹{Number(selectedOrder.subtotal).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground font-medium">
                          <span>GST</span>
                          <span>₹{Number(selectedOrder.gst).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground font-medium">
                          <span>Delivery Fee</span>
                          <span>₹{Number(selectedOrder.delivery_fee).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground font-medium">
                          <span>Discount</span>
                          <span className="text-green-600 font-bold">-₹{Number(selectedOrder.discount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-border pt-4 mt-2">
                          <span>Total Amount</span>
                          <span className="text-primary font-display font-black">₹{Number(selectedOrder.total).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex gap-4">
                      {selectedOrder.status === "Pending" && (
                        <button 
                          onClick={() => handleOrderStatusUpdate(selectedOrder.order_id, "Cancelled")}
                          className="flex-1 py-4 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-destructive hover:text-white transition-all duration-300"
                        >
                          Cancel Order
                        </button>
                      )}
                      {selectedOrder.status === "Delivered" && (
                        <button 
                          onClick={() => handleOrderStatusUpdate(selectedOrder.order_id, "Returned")}
                          className="flex-1 py-4 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                        >
                          Initiate Return
                        </button>
                      )}
                   </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]" onClick={() => setActiveView("overview")}>
              <ChevronLeftLucide size={14} /> Back to My Account
            </div>
            <h3 className="text-xl font-display font-bold">My Orders</h3>
            {loading ? (
              <div className="py-20 text-center uppercase tracking-widest text-xs animate-pulse font-bold text-muted-foreground">Retrieving orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-24 text-center bg-card/50 border border-dashed border-border p-12 rounded-3xl">
                <div className="w-16 h-16 bg-secondary mx-auto mb-6 flex items-center justify-center rounded-full">
                  <PackageLucide className="text-muted-foreground" size={32} />
                </div>
                <h4 className="text-xl font-display font-bold mb-2">No orders found</h4>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">You haven't placed any orders yet. Explore our latest saree collection today!</p>
                <Link to="/" className="inline-block bg-primary text-white px-10 py-4 font-bold uppercase tracking-widest text-[10px] rounded-full hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => (
                  <div key={order.order_id} onClick={() => setSelectedOrder(order)} className="group border border-border bg-card p-6 rounded-2xl hover:border-primary/50 transition-all duration-500 cursor-pointer hover:shadow-xl hover:shadow-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-700"></div>
                    
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6 relative z-10">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Order Reference</p>
                        <p className="text-sm font-bold font-mono tracking-tighter">#{order.order_id}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Placed On</p>
                        <p className="text-sm font-bold">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Order Total</p>
                        <p className="text-sm font-black text-primary">₹{Number(order.total).toLocaleString('en-IN')}</p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border ${
                        order.status === "Delivered" ? "bg-green-50 border-green-100 text-green-700" : 
                        order.status === "Cancelled" ? "bg-red-50 border-red-100 text-red-700" :
                        "bg-blue-50 border-blue-100 text-blue-700"
                      } text-[9px] font-black uppercase tracking-[0.15em]`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4 flex items-center justify-between relative z-10">
                       <div className="flex -space-x-3 overflow-hidden">
                          {/* Item count/indicators */}
                          {order.items?.slice(0, 3).map((item, i) => (
                             <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold overflow-hidden">
                               {item.product_image ? (
                                 <img 
                                   src={formatImageUrl(item.product_image)} 
                                   alt="" 
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <PackageLucide size={12} className="text-muted-foreground" />
                               )}
                             </div>
                          ))}
                          {order.items?.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-background bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                              +{order.items.length - 3}
                            </div>
                          )}
                       </div>
                       <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] group-hover:gap-4 transition-all duration-300">
                          View Details <ChevronRightLucide size={14} />
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "profile":
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]" onClick={() => setActiveView("overview")}>
              <ChevronLeftLucide size={14} /> Back to My Account
            </div>
            <h3 className="text-xl font-display font-bold">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="bg-card border border-border p-10 rounded-3xl space-y-8 shadow-xl shadow-black/[0.02]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileData.full_name} 
                    onChange={e => setProfileData({...profileData, full_name: e.target.value})}
                    placeholder="Enter your full name"
                    className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={profileData.email} 
                    disabled
                    className="w-full p-4 bg-secondary/50 border border-border outline-none cursor-not-allowed text-muted-foreground rounded-xl font-medium"
                  />
                </div>
                 <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={profileData.phone} 
                    onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="e.g. 9876543210"
                    className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : ""} 
                    onChange={e => setProfileData({...profileData, date_of_birth: e.target.value})}
                    className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Gender</label>
                  <select 
                    value={profileData.gender} 
                    onChange={e => setProfileData({...profileData, gender: e.target.value})}
                    className="w-full p-4 bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all rounded-xl font-medium appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary text-white px-12 py-4 font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  <SaveLucide size={14} /> {loading ? "Updating..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        );
      case "addresses":
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6 cursor-pointer hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]" onClick={() => { setActiveView("overview"); setIsEditingAddress(false); }}>
              <ChevronLeftLucide size={14} /> Back to My Account
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold">Delivery Addresses</h3>
                <p className="text-sm text-muted-foreground">Manage your shipping addresses for a faster checkout experience.</p>
              </div>
              {!isEditingAddress && (
                <button 
                  onClick={handleAddNewAddress}
                  className="bg-primary text-white p-4 rounded-full hover:shadow-lg transition-all active:scale-95"
                  title="Add New Address"
                >
                  <PlusIcon size={20} />
                </button>
              )}
            </div>

            {isEditingAddress ? (
              <form onSubmit={handleSaveAddress} className="bg-card border border-border p-10 rounded-3xl space-y-8 shadow-xl shadow-black/[0.02]">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-border pb-4">{selectedAddress ? "Edit Address" : "Add New Address"}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.full_name} 
                      onChange={e => setAddressForm({...addressForm, full_name: e.target.value})}
                      className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={addressForm.phone} 
                      onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                      className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Address Line 1</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.address_line_1} 
                    onChange={e => setAddressForm({...addressForm, address_line_1: e.target.value})}
                    placeholder="House No, Apartment, Street"
                    className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Address Line 2 (Optional)</label>
                  <input 
                    type="text" 
                    value={addressForm.address_line_2} 
                    onChange={e => setAddressForm({...addressForm, address_line_2: e.target.value})}
                    placeholder="Landmark, Area, etc."
                    className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">City</label>
                    <input type="text" required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">State</label>
                    <input type="text" required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Pincode</label>
                    <input type="text" required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-full p-4 bg-background border border-border focus:border-primary outline-none transition-all rounded-xl font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground ml-1">Address Type</label>
                    <div className="flex gap-4">
                      {["Home", "Work"].map(type => (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => setAddressForm({...addressForm, address_type: type})}
                          className={`flex-1 py-3 border-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${addressForm.address_type === type ? "border-primary bg-primary text-white" : "border-border hover:border-primary/30"}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input 
                      type="checkbox" 
                      id="is_default"
                      checked={addressForm.is_default} 
                      onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})}
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="is_default" className="text-xs font-bold text-muted-foreground">Set as default address</label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-4 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:shadow-xl transition-all">
                    {loading ? "Saving..." : "Save Address"}
                  </button>
                  <button type="button" onClick={() => setIsEditingAddress(false)} className="flex-1 border border-border py-4 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 ? (
                  <div className="md:col-span-2 py-16 text-center bg-secondary/30 rounded-3xl border border-dashed border-border text-muted-foreground">
                    <p className="text-sm font-bold uppercase tracking-widest">No addresses saved yet</p>
                    <button onClick={handleAddNewAddress} className="mt-4 text-primary font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-primary">Add your first address</button>
                  </div>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.address_id} className={`bg-card border p-8 rounded-3xl relative group transition-all duration-500 hover:shadow-xl ${addr.is_default ? "border-primary" : "border-border"}`}>
                      {addr.is_default && (
                        <span className="absolute -top-3 left-8 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Default Address</span>
                      )}
                      
                      <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditAddress(addr)} className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-all"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteAddress(addr.address_id)} className="p-2 bg-secondary rounded-full hover:bg-destructive hover:text-white transition-all"><Trash2 size={14} /></button>
                      </div>

                      <div className="mb-4">
                         <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-secondary rounded text-primary mb-3 inline-block">{addr.address_type}</span>
                         <h4 className="font-display text-lg font-bold">{addr.full_name}</h4>
                         <p className="text-xs font-bold text-muted-foreground mt-1">{addr.phone}</p>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {addr.address_line_1}<br/>
                        {addr.address_line_2 && <>{addr.address_line_2}<br/></>}
                        {addr.city}, {addr.state} - {addr.pincode}<br/>
                        {addr.country}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex flex-col gap-4 animate-in fade-in duration-700">
            {menuItems.map((item) => {
              const cls = "flex items-center gap-6 p-6 border border-border bg-white hover:border-primary/50 group transition-all duration-300 cursor-pointer rounded-2xl hover:shadow-lg hover:shadow-primary/5";
              const content = (
                <>
                  <div className="w-12 h-12 bg-secondary/50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-all duration-300 rounded-xl group-hover:scale-105">
                    <item.icon size={20} className="text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">{item.label}</h4>
                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                    <ChevronRightLucide size={14} className="text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                </>
              );
              if (item.link) {
                return <Link key={item.id} to={item.link} className={cls}>{content}</Link>;
              }
              return <div key={item.id} className={cls} onClick={item.action}>{content}</div>;
            })}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-24 lg:py-32 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* User Sidebar Info */}
            <div className="lg:col-span-4 w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-card border border-border p-12 rounded-[40px] shadow-2xl shadow-black/[0.03] text-center sticky top-32">
                <div className="relative mx-auto mb-10 w-40 h-40">
                  <div className="w-full h-full rounded-full bg-secondary mx-auto flex items-center justify-center border-8 border-background shadow-2xl overflow-hidden relative group">
                    {profileData.profile_picture_url ? (
                      <img src={profileData.profile_picture_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <UserLucide size={80} className="text-muted-foreground" />
                    )}
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
                    >
                      <Camera size={24} className="mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{uploading ? "..." : "Change"}</span>
                    </button>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
                
                <h3 className="font-display text-2xl font-black text-foreground mb-1 leading-tight">{user?.full_name || user?.name || "Welcome"}</h3>
                <p className="font-body text-xs text-muted-foreground mb-8 tracking-wide font-medium">{user?.email}</p>
                
                <div className="space-y-6 text-left border-t border-border pt-10 mb-12">
                  <div className="flex items-center gap-5 text-sm group">
                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                      <MailLucide size={18} className="text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Email Address</p>
                      <span className="text-foreground font-bold truncate max-w-[180px] block">{user?.email}</span>
                    </div>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-5 text-sm group">
                      <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                        <PhoneLucide size={18} className="text-primary group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Mobile Number</p>
                        <span className="text-foreground font-bold">{user?.phone}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-5 text-sm group">
                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary transition-all duration-300">
                      <ShieldCheckLucide size={18} className="text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-0.5">Account Status</p>
                      <span className="text-primary font-black uppercase tracking-[0.2em]">Verified Member</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-5 bg-secondary/80 text-foreground hover:bg-destructive hover:text-white font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-500 flex items-center justify-center gap-2 rounded-2xl active:scale-95"
                >
                  <LogOutLucide size={14} /> SIGN OUT
                </button>
              </div>
            </div>

            {/* Main Dynamic View Area */}
            <div className="flex-1">
              <div className="mb-10">
                <h2 className="font-display text-3xl font-black text-foreground mb-4 relative inline-block group">
                   <span className="relative z-10">{activeView === "overview" ? "My Account" : activeView.charAt(0).toUpperCase() + activeView.slice(1)}</span>
                   <span className="absolute -bottom-1 left-0 w-12 h-1.5 bg-primary/20 group-hover:w-full transition-all duration-500"></span>
                </h2>
                <p className="text-muted-foreground text-xs font-medium italic tracking-wide">Customize your preference and manage your sarees effortlessly.</p>
              </div>
              
              <div className="min-h-[600px]">
                {renderView()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
