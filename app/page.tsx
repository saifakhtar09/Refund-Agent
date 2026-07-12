'use client';

import { Header } from '@/components/header';
import { ChatPanel } from '@/components/chat-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customers } from '@/data/customers';

import { cn } from '@/lib/utils';

import { MessageSquare, Users, Clock, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const totalCustomers = customers.length;
  const pendingRefunds = customers.filter(c => c.refundStatus === 'Pending').length;
  const totalRefundAmount = customers
    .filter(c => c.refundRequested)
    .reduce((sum, c) => sum + c.productPrice, 0);

  const stats = [
    {
      label: 'Total Customers',
      value: totalCustomers,
      sub: 'In CRM database',
      icon: Users,
      iconColor: 'text-indigo-500',
    },
    {
      label: 'Pending Refunds',
      value: pendingRefunds,
      sub: 'Awaiting processing',
      icon: Clock,
      iconColor: 'text-amber-500',
    },
    {
      label: 'Refund Requests',
      value: customers.filter(c => c.refundRequested).length,
      sub: 'Total requests',
      icon: MessageSquare,
      iconColor: 'text-sky-500',
    },
    {
      label: 'Total Value',
      value: `$${totalRefundAmount.toFixed(2)}`,
      sub: 'In refund requests',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <div className="container py-9 px-4">
        {/* STATS GRID */}
       
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {stats.map((s) => (
    <div
      key={s.label}
      className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"
    >
      {/* Glow background */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

      <Card
        className={cn(
          "relative h-full rounded-2xl border-0",
          "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md",
          "transition-all duration-300",
          "group-hover:-translate-y-1 group-hover:scale-[1.02]",
          "group-hover:shadow-2xl"
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[13px] font-medium text-muted-foreground">
            {s.label}
          </CardTitle>

          <s.icon
            className={cn(
              "h-5 w-5 transition-all duration-300",
              s.iconColor,
              "group-hover:scale-110 group-hover:rotate-6"
            )}
          />
        </CardHeader>

        <CardContent>
          <div
            className="text-[30px] font-bold tracking-tight transition-all duration-300 group-hover:tracking-wide"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {s.value}
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {s.sub}
          </p>
        </CardContent>
      </Card>
    </div>
  ))}
</div>
        <ChatPanel />
       
    
      </div>
    </div>
  );
}