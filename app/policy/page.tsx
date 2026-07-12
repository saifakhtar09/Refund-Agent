'use client';

import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { refundPolicyMd } from '@/data/refundPolicy';
import ReactMarkdown from 'react-markdown';


export default function PolicyPage() {
  // Quick reference rules
  const quickRules = [
    { rule: 'Returns within 14 days', eligible: true },
    { rule: 'Product must be unused', eligible: true, note: 'Original packaging required' },
    { rule: 'Gift cards', eligible: false, note: 'Non-refundable' },
    { rule: 'Custom products', eligible: false, note: 'Personalized items are final sale' },
    { rule: 'Electronics after activation', eligible: false, note: 'Cannot be refunded' },
    { rule: 'Refunds above $500', eligible: true, note: 'Requires manager approval' },
    { rule: 'Beauty products (opened)', eligible: false, note: 'Hygiene restrictions' },
    { rule: 'Damaged in transit', eligible: true, note: 'Report within 48 hours' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-6 px-4">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Refund Policy</h1>
            <p className="text-muted-foreground">
              Guidelines and rules for processing refund requests
            </p>
          </div>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Reference Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickRules.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {item.eligible ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.rule}</p>
                      {item.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complete Policy Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <article className="react-markdown">
                  <ReactMarkdown>{refundPolicyMd}</ReactMarkdown>
                </article>
              </div>
            </CardContent>
          </Card>

          {/* Decision Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Decision Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Verify Customer Identity</p>
                    <p className="text-sm text-muted-foreground">
                      Search by email, order ID, or name
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Check Order Status</p>
                    <p className="text-sm text-muted-foreground">
                      Only delivered orders are eligible
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Calculate Days Since Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Must be within 14-day window
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Check Product Category Rules</p>
                    <p className="text-sm text-muted-foreground">
                      Gift cards, custom products, electronics have special rules
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    5
                  </div>
                  <div>
                    <p className="font-medium">Verify Product Condition</p>
                    <p className="text-sm text-muted-foreground">
                      Must be unused with original packaging
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                    6
                  </div>
                  <div>
                    <p className="font-medium">Make Decision</p>
                    <p className="text-sm text-muted-foreground">
                      Approved or denied with reasoning
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
