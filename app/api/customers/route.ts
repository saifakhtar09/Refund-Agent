import { NextRequest, NextResponse } from 'next/server';
import { customers, findCustomerById, findCustomerByEmail, findCustomerByName, findCustomerByOrderId } from '@/data/customers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (query) {
    // Search for a specific customer
    let customer = findCustomerById(query);
    if (!customer) customer = findCustomerByEmail(query);
    if (!customer) customer = findCustomerByOrderId(query);
    if (!customer) customer = findCustomerByName(query);

    if (customer) {
      return NextResponse.json({ customer });
    }
    return NextResponse.json({ customer: null });
  }

  // Return all customers
  return NextResponse.json({ customers });
}
