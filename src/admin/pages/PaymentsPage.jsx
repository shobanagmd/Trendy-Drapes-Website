import { useState } from "react";
import { StatCard } from "@/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CreditCard, AlertCircle, CheckCircle2, RefreshCcw, Landmark, Clock } from "lucide-react";

const paymentsData = [
  { id: "PAY-10041", orderId: "ORD-78451", customer: "Rahul Sharma", amount: "₹19,918", method: "UPI", status: "Success", date: "Mar 21, 2026 14:30" },
  { id: "PAY-10042", orderId: "ORD-78450", customer: "Priya Patel", amount: "₹7,199", method: "Card", status: "Success", date: "Mar 21, 2026 13:15" },
  { id: "PAY-10043", orderId: "ORD-78449", customer: "Amit Kumar", amount: "₹33,000", method: "Cash on Delivery", status: "Pending", date: "Mar 20, 2026 18:22" },
  { id: "PAY-10044", orderId: "ORD-78448", customer: "Sneha Reddy", amount: "₹12,480", method: "UPI", status: "Success", date: "Mar 20, 2026 11:40" },
  { id: "PAY-10045", orderId: "ORD-78447", customer: "Vikram Singh", amount: "₹25,600", method: "Card", status: "Failed", date: "Mar 19, 2026 09:25" },
  { id: "PAY-10046", orderId: "ORD-78446", customer: "Meera Joshi", amount: "₹14,240", method: "Wallet", status: "Refunded", date: "Mar 19, 2026 16:50" },
  { id: "PAY-10047", orderId: "ORD-78445", customer: "Karan Mehta", amount: "₹7,999", method: "UPI", status: "Success", date: "Mar 18, 2026 10:10" },
  { id: "PAY-10048", orderId: "ORD-78444", customer: "Anita Desai", amount: "₹21,360", method: "Card", status: "Failed", date: "Mar 18, 2026 14:30" },
];

const statusStyles = {
  Success: "badge-success",
  Failed: "badge-danger",
  Pending: "badge-warning",
  Refunded: "badge-info",
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPayments = paymentsData.filter((p) => {
    const matchesSearch =
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <div className="page-header">
        <h1 className="page-title">Payments & Refunds</h1>
        <p className="page-subtitle">Track incoming payments, failed transactions, and process customer refunds</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Collected" value="₹67.6L" todayValue="₹1,24,500" change="+12% this month" changeType="positive" icon={Landmark} />
        <StatCard title="Successful Txns" value="1,842"  todayValue="48"        change="92% success rate" changeType="positive" icon={CheckCircle2} />
        <StatCard title="Failed Txns"     value="48"     todayValue="3"         change="Needs attention"  changeType="negative" icon={AlertCircle} />
        <StatCard title="Pending Refunds" value="12"     todayValue="2"         change="Awaiting processing" changeType="neutral" icon={RefreshCcw} />
      </div>

      {/* Payment List Section */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by Payment ID, Order ID, or Customer"
              className="pl-9 bg-secondary border-none h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["All", "Success", "Failed", "Pending", "Refunded"].map((s) => (
              <Button
                key={s}
                variant={s === statusFilter ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[15%] text-left">Payment ID</th>
                <th className="w-[15%] text-left">Order ID</th>
                <th className="w-[20%] text-left">Customer</th>
                <th className="w-[15%] text-right">Amount</th>
                <th className="w-[15%] text-left">Method</th>
                <th className="w-[15%] text-left">Date</th>
                <th className="w-[5%] text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-card-foreground text-left">{p.id}</td>
                  <td className="text-muted-foreground text-left">
                    <span className="hover:underline cursor-pointer hover:text-primary">{p.orderId}</span>
                  </td>
                  <td className="font-medium text-card-foreground text-left">{p.customer}</td>
                  <td className="text-card-foreground font-bold text-right">{p.amount}</td>
                  <td className="text-left text-muted-foreground">{p.method}</td>
                  <td className="text-xs text-muted-foreground text-left">{p.date}</td>
                  <td className="text-center">
                    <span className={statusStyles[p.status]}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted-foreground">
                    No transactions match the selected filters.
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
