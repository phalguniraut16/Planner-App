import { useState } from "react";
import { useFinance } from "@/hooks/useFinance";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, DollarSign, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { formatCurrency } from "@/lib/utils";

export default function FinancePage() {
  const { transactions, isLoading, createTransaction, deleteTransaction, getTotals } = useFinance();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");

  const { income, expense, net } = getTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const amount = parseInt(formData.get("amount") as string, 10);
    if (!amount || amount <= 0) return;

    await createTransaction.mutateAsync({
      type,
      amount_cents: amount * 100,
      currency: "INR",
      transaction_date: new Date().toISOString().split("T")[0],
      category: formData.get("category") as string,
      description: formData.get("description") as string || null,
      payment_method: formData.get("payment_method") as string || null,
    });
    setOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Track income, expenses, and budgets</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Income</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(income / 100, "INR")}</p>
            </div>
            <div className="mt-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Expenses</p>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(expense / 100, "INR")}</p>
            </div>
            <div className="mt-4">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Balance</p>
              <p className={`text-2xl font-bold ${net >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatCurrency(net / 100, "INR")}
              </p>
            </div>
            <div className="mt-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.type === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    }`}>
                      {tx.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-medium">{tx.description || tx.category}</div>
                      <div className="text-xs text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`font-medium ${tx.type === "income" ? "text-green-500" : "text-red-500"}`}>
                    {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount_cents / 100, "INR")}
                  </div>
                  <button
                    onClick={() => deleteTransaction.mutateAsync(tx.id)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
            <DialogDescription>Record income or expense</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`p-3 rounded-lg border font-medium transition-colors ${
                    type === "income" ? "bg-green-500 text-white border-green-500" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`p-3 rounded-lg border font-medium transition-colors ${
                    type === "expense" ? "bg-red-500 text-white border-red-500" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input id="amount" type="number" name="amount" placeholder="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" defaultValue="general">
                  <option value="general">General</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="bills">Bills</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="salary">Salary</option>
                  <option value="freelance">Freelance</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional" />
            </div>
            <Button type="submit" className="w-full">
              Save Transaction
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
