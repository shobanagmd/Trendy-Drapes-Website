import { useState } from "react";
import { StatCard } from "@/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, AlertTriangle, CheckCircle, XCircle, Banknote, ListCollapse } from "lucide-react";

const returnsData = [
  { id: "RET-2841", orderId: "ORD-78452", customer: "Sanjay Gupta", reason: "Damaged Package", amount: "₹9,600", status: "Pending", date: "Mar 21, 2026" },
  { id: "RET-2842", orderId: "ORD-78445", customer: "Neha Rao", reason: "Wrong Product Received", amount: "₹7,199", status: "Approved", date: "Mar 20, 2026" },
  { id: "RET-2843", orderId: "ORD-78410", customer: "Varun Desai", reason: "Size Mismatch", amount: "₹3,640", status: "Refunded", date: "Mar 19, 2026" },
  { id: "RET-2844", orderId: "ORD-78401", customer: "Pooja Hegde", reason: "Changed Mind", amount: "₹16,800", status: "Rejected", date: "Mar 18, 2026" },
  { id: "RET-2845", orderId: "ORD-78399", customer: "Rohan Kumar", reason: "Item Not Working", amount: "₹28,000", status: "Pending", date: "Mar 17, 2026" },
];

const statusStyles = {
  Pending: "badge-warning",
  Approved: "badge-success",
  Rejected: "badge-danger",
  Refunded: "badge-neutral",
};

export default function ReturnsPage() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(returnsData);

  const filteredReturns = data.filter((r) =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.orderId.toLowerCase().includes(search.toLowerCase()) ||
    r.customer.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = (id, newStatus) => {
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Returns & Refunds</h1>
        <p className="page-subtitle">Manage customer return requests, approve items, and initiate refunds</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Requests" value="24"     todayValue="5"   change="Needs action"          changeType="negative" icon={AlertTriangle} />
        <StatCard title="Approved Returns" value="142"    todayValue="12"  change="Awaiting item return"  changeType="neutral"  icon={RotateCcw} />
        <StatCard title="Total Refunded"   value="₹9.92L" todayValue="₹18,400" change="This month"           changeType="neutral"  icon={Banknote} />
        <StatCard title="Rejected"         value="18"     todayValue="1"   change="Invalid claims"        changeType="positive" icon={XCircle} />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Return ID, Order ID, or Customer"
              className="pl-9 bg-secondary border-none h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[12%] text-left">Return ID</th>
                <th className="w-[12%] text-left">Order ID</th>
                <th className="w-[16%] text-left">Customer</th>
                <th className="w-[18%] text-left">Reason</th>
                <th className="w-[10%] text-right">Amount</th>
                <th className="w-[10%] text-center">Status</th>
                <th className="w-[22%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((r) => (
                <tr key={r.id}>
                  <td className="font-semibold text-card-foreground text-left">{r.id}</td>
                  <td className="text-muted-foreground text-left hover:underline cursor-pointer hover:text-primary">{r.orderId}</td>
                  <td className="font-medium text-card-foreground text-left">{r.customer}</td>
                  <td className="text-left">
                    <div className="flex items-center gap-1.5">
                      <ListCollapse className="h-3 w-3 text-muted-foreground" />
                      <span className="text-card-foreground text-sm">{r.reason}</span>
                    </div>
                  </td>
                  <td className="text-card-foreground font-bold text-right">{r.amount}</td>
                  <td className="text-center">
                    <span className={statusStyles[r.status]}>{r.status}</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      {r.status === "Pending" && (
                        <>
                          <Button size="sm" className="h-7 text-xs px-2 gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleAction(r.id, "Approved")}>
                            <CheckCircle className="h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs px-2 gap-1" onClick={() => handleAction(r.id, "Rejected")}>
                            <XCircle className="h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                      {r.status === "Approved" && (
                        <Button size="sm" variant="secondary" className="h-7 text-xs px-2 gap-1" onClick={() => handleAction(r.id, "Refunded")}>
                          <Banknote className="h-3 w-3" /> Initiate Refund
                        </Button>
                      )}
                      {(r.status === "Refunded" || r.status === "Rejected") && (
                        <span className="text-xs text-muted-foreground font-medium">No actions available</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted-foreground">
                    No return requests match the search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
