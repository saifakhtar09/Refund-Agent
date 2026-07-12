export const refundPolicyMd = `
# Refund Policy

## General Return Policy

**All refunds are subject to the following conditions:**

### 1. Standard Return Window

- Returns must be requested within **14 days** of delivery date.
- The return window starts from the day after the delivery date.
- After 14 days, no refunds will be processed except for defective items.

### 2. Product Condition Requirements

- **Product must be unused** and in original packaging.
- All tags, labels, and accessories must be intact.
- Products showing signs of use, wear, or damage will not be accepted.
- Hygiene products (beauty, skincare) must be unopened and sealed.

### 3. Category-Specific Rules

#### Electronics
- Electronics cannot be refunded once activated or registered.
- Smart devices must be factory reset before return.
- Software licenses are non-refundable after activation.
- Electronic accessories must include all original components.

#### Gift Cards
- **All gift cards are non-refundable.**
- Gift cards cannot be exchanged for cash.
- Unused gift cards cannot be returned or refunded.

#### Custom Products
- **Custom-made or personalized products cannot be refunded.**
- This includes engraved items, custom sizes, personalized gifts.
- Custom orders cannot be cancelled once production begins.

#### Beauty & Personal Care
- Must be unopened and in original sealed packaging.
- Products that have been opened or used cannot be returned for hygiene reasons.
- Sample products cannot be returned.

#### Clothing & Shoes
- Must be unworn with all original tags attached.
- Shoes must not show signs of wear on soles.
- Clothing must not have been washed or altered.

### 4. Price-Based Restrictions

#### Refunds Above $500
- **Require manager approval.**
- Additional processing time of 3-5 business days.
- Customer may be contacted for verification.
- Large refunds may be issued in installments.

#### Refunds Below $500
- Standard processing applies.
- Refund issued within 5-7 business days.

### 5. Order Status Requirements

- Only orders with **"Delivered"** status can be refunded.
- Orders "In Transit" or "Processing" cannot be refunded until delivered.
- Cancelled orders are not eligible for refund requests.

### 6. Refund Process

1. Customer initiates refund request with order details.
2. Support agent verifies customer identity and order.
3. Agent checks refund policy eligibility.
4. If eligible, refund is approved and processed.
5. If ineligible, customer is informed of the reason.

### 7. Refund Denial Reasons

A refund may be denied if:

- Outside the 14-day return window
- Product has been used or shows signs of wear
- Product category is non-refundable (gift cards, custom products)
- Electronics have been activated
- Beauty products have been opened
- Price requires manager approval (pending approval)
- Order has not been delivered
- Invalid customer or order information

### 8. Special Circumstances

#### Defective Products
- Defective products may be returned outside the standard window.
- Must provide evidence of defect (photos/videos).
- May be eligible for replacement instead of refund.

#### Wrong Item Shipped
- Full refund guaranteed regardless of other conditions.
- Return shipping provided at no cost.
- Correct item will be shipped if available.

#### Damaged in Transit
- Must report within 48 hours of delivery.
- Photographic evidence required.
- Full refund or replacement offered.

## Quick Reference Eligibility Matrix

| Factor | Eligible | Not Eligible |
|--------|----------|--------------|
| Within 14 days | Yes | No |
| Unused product | Yes | No |
| Electronics (not activated) | Yes | No (if activated) |
| Gift Cards | No | Always |
| Custom Products | No | Always |
| Price > $500 | Pending approval | No |
| Delivered status | Yes | No |

---
*This policy is effective as of January 1, 2024 and subject to updates.*
`;

export interface PolicyCheckResult {
  eligible: boolean;
  reason: string;
  policySection?: string;
}

export function checkRefundPolicy(
  daysSinceDelivery: number,
  productUsed: boolean,
  productCategory: string,
  productPrice: number,
  orderStatus: string
): PolicyCheckResult {
  // Check order status
  if (orderStatus !== 'Delivered') {
    return {
      eligible: false,
      reason: `Order status is "${orderStatus}". Only delivered orders can be refunded.`,
      policySection: 'Section 5: Order Status Requirements'
    };
  }

  // Check return window (14 days)
  if (daysSinceDelivery > 14) {
    return {
      eligible: false,
      reason: `Purchase was ${daysSinceDelivery} days ago. Returns must be requested within 14 days of delivery.`,
      policySection: 'Section 1: Standard Return Window'
    };
  }

  // Check if product has been used
  if (productUsed) {
    return {
      eligible: false,
      reason: 'Product has been used. Returns require unused products in original packaging.',
      policySection: 'Section 2: Product Condition Requirements'
    };
  }

  // Check gift cards
  if (productCategory === 'Gift Cards') {
    return {
      eligible: false,
      reason: 'Gift cards are non-refundable. This is a strict policy with no exceptions.',
      policySection: 'Section 3: Category-Specific Rules - Gift Cards'
    };
  }

  // Check custom products
  if (productCategory === 'Custom Products') {
    return {
      eligible: false,
      reason: 'Custom-made products cannot be refunded. Personalized items are final sale.',
      policySection: 'Section 3: Category-Specific Rules - Custom Products'
    };
  }

  // Check electronics activation (assumed activated if used)
  if (productCategory === 'Electronics' && productUsed) {
    return {
      eligible: false,
      reason: 'Electronics that have been activated cannot be refunded.',
      policySection: 'Section 3: Category-Specific Rules - Electronics'
    };
  }

  // Check if manager approval needed
  if (productPrice > 500) {
    return {
      eligible: true,
      reason: `Refund eligible. However, refunds above $500 require manager approval. Additional processing time of 3-5 business days applies.`,
      policySection: 'Section 4: Price-Based Restrictions'
    };
  }

  // All checks passed
  return {
    eligible: true,
    reason: 'Refund approved. All policy conditions have been met.',
    policySection: 'Standard Processing'
  };
}

export function calculateDaysSinceDelivery(deliveryDate: string): number {
  const delivery = new Date(deliveryDate);
  const today = new Date('2024-01-30'); // Using a fixed date for consistency
  const diffTime = Math.abs(today.getTime() - delivery.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
