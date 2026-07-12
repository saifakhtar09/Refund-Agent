import { Customer } from '@/types';

export const customers: Customer[] = [
  {
    id: 'cust_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    orderId: 'ord_1001',
    productName: 'Wireless Bluetooth Headphones',
    productCategory: 'Electronics',
    purchaseDate: '2024-01-10',
    deliveryDate: '2024-01-14',
    productPrice: 149.99,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    orderId: 'ord_1002',
    productName: 'Running Shoes - Air Max Pro',
    productCategory: 'Shoes',
    purchaseDate: '2024-01-15',
    deliveryDate: '2024-01-18',
    productPrice: 189.99,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_003',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    orderId: 'ord_1003',
    productName: 'Organic Face Cream Set',
    productCategory: 'Beauty',
    purchaseDate: '2024-01-05',
    deliveryDate: '2024-01-08',
    productPrice: 75.00,
    orderStatus: 'Delivered',
    productUsed: true,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_004',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    orderId: 'ord_1004',
    productName: 'Smart Watch Series X',
    productCategory: 'Electronics',
    purchaseDate: '2024-01-20',
    deliveryDate: '2024-01-25',
    productPrice: 599.99,
    orderStatus: 'Delivered',
    productUsed: true,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_005',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    orderId: 'ord_1005',
    productName: 'Garden Tool Set Premium',
    productCategory: 'Home & Garden',
    purchaseDate: '2024-01-02',
    deliveryDate: '2024-01-06',
    productPrice: 120.00,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_006',
    name: 'Robert Taylor',
    email: 'robert.taylor@email.com',
    orderId: 'ord_1006',
    productName: 'Amazon Gift Card $100',
    productCategory: 'Gift Cards',
    purchaseDate: '2024-01-22',
    deliveryDate: '2024-01-22',
    productPrice: 100.00,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_007',
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@email.com',
    orderId: 'ord_1007',
    productName: 'Custom Engraved Necklace',
    productCategory: 'Custom Products',
    purchaseDate: '2024-01-08',
    deliveryDate: '2024-01-15',
    productPrice: 250.00,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_008',
    name: 'David Brown',
    email: 'david.brown@email.com',
    orderId: 'ord_1008',
    productName: 'Leather Jacket Classic',
    productCategory: 'Clothing',
    purchaseDate: '2024-01-12',
    deliveryDate: '2024-01-17',
    productPrice: 299.99,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: false,
    refundStatus: 'Not Requested'
  },
  {
    id: 'cust_009',
    name: 'Amanda White',
    email: 'amanda.white@email.com',
    orderId: 'ord_1009',
    productName: 'Yoga Mat Premium',
    productCategory: 'Sports',
    purchaseDate: '2024-01-18',
    deliveryDate: '2024-01-21',
    productPrice: 45.00,
    orderStatus: 'Delivered',
    productUsed: true,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_010',
    name: 'Christopher Lee',
    email: 'christopher.lee@email.com',
    orderId: 'ord_1010',
    productName: 'Programming Mastery Bundle',
    productCategory: 'Books',
    purchaseDate: '2024-01-06',
    deliveryDate: '2024-01-11',
    productPrice: 89.99,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_011',
    name: 'Jessica Thompson',
    email: 'jessica.thompson@email.com',
    orderId: 'ord_1011',
    productName: 'Wireless Earbuds Pro',
    productCategory: 'Electronics',
    purchaseDate: '2024-01-25',
    deliveryDate: '2024-01-28',
    productPrice: 199.99,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_012',
    name: 'Daniel Garcia',
    email: 'daniel.garcia@email.com',
    orderId: 'ord_1012',
    productName: 'Designer Dress Shoes',
    productCategory: 'Shoes',
    purchaseDate: '2024-01-01',
    deliveryDate: '2024-01-05',
    productPrice: 350.00,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_013',
    name: 'Michelle Robinson',
    email: 'michelle.robinson@email.com',
    orderId: 'ord_1013',
    productName: 'Smart Home Hub',
    productCategory: 'Electronics',
    purchaseDate: '2024-01-14',
    deliveryDate: '2024-01-19',
    productPrice: 799.99,
    orderStatus: 'Delivered',
    productUsed: true,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_014',
    name: 'Kevin Harris',
    email: 'kevin.harris@email.com',
    orderId: 'ord_1014',
    productName: 'Winter Parka Jacket',
    productCategory: 'Clothing',
    purchaseDate: '2024-01-16',
    deliveryDate: '2024-01-20',
    productPrice: 225.00,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  },
  {
    id: 'cust_015',
    name: 'Rachel Clark',
    email: 'rachel.clark@email.com',
    orderId: 'ord_1015',
    productName: 'Luxury Skincare Kit',
    productCategory: 'Beauty',
    purchaseDate: '2024-01-23',
    deliveryDate: '2024-01-27',
    productPrice: 550.00,
    orderStatus: 'Delivered',
    productUsed: false,
    refundRequested: true,
    refundStatus: 'Pending'
  }
];

export function findCustomerById(id: string): Customer | undefined {
  return customers.find(c => c.id === id);
}

export function findCustomerByEmail(email: string): Customer | undefined {
  return customers.find(c => c.email.toLowerCase() === email.toLowerCase());
}

export function findCustomerByName(name: string): Customer | undefined {
  return customers.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
}

export function findCustomerByOrderId(orderId: string): Customer | undefined {
  return customers.find(c => c.orderId.toLowerCase() === orderId.toLowerCase());
}
