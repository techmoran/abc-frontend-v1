'use server';

import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  LatestInvoice,
  Revenue,
  User,
} from './definitions';
import { formatCurrency } from './utils';
import { promises as fs } from 'fs';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    //const data = await sql<Revenue>`SELECT * FROM revenue`;
    const data : Revenue[] = JSON.parse(await fs.readFile(process.cwd() + '/app/lib/chartdata.json', 'utf8'));
    console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {

    console.log('Fetching latest invoice data...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const res = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/invoice');
    const latestInvoices : LatestInvoice[] = await res.json();
    console.log('Data fetch completed after 3 seconds.'); 
    return latestInvoices.slice(0,6);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    // const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    // const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    // const invoiceStatusPromise = sql`SELECT
    //      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
    //      SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
    //      FROM invoices`;
    const invoiceCountPromise = 100;
    const customerCountPromise = 19;
    const invoiceStatusPromise = 1065896
    
    console.log('Fetching card data...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0] ?? '0');
    const numberOfCustomers = Number(data[1] ?? '0');
    const totalPaidInvoices = formatCurrency(data[2] ?? '0');
    const totalPendingInvoices = formatCurrency(data[2] ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  console.log('offset query', offset)

  try {
    
    const res = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/invoice');
    const invoices : InvoicesTable[] = await res.json();
    const lowerCased = query.toLowerCase();
          
    const result : InvoicesTable[] = invoices
                        .filter((inv) => inv.name.toLowerCase().includes(lowerCased) || inv.email.toLowerCase().includes(lowerCased))
    return result.slice(offset,offset + 6);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {

    const res = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/invoice');
    const invoices : InvoicesTable[] = await res.json();
    const lowerCased = query.toLowerCase();
    console.log(lowerCased)
    const count = invoices
                        .filter((inv) => inv.name.toLowerCase().includes(lowerCased) || inv.email.toLowerCase().includes(lowerCased))
                        .length;
    const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
     
    const res = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/invoice');
    const data : InvoicesTable[] = await res.json();

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));
    
    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
     
    const res = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/customers');
    const customers : CustomerField[] = await res.json();
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getLoginUser(email: string) {
  try {
    const res = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/customers');
    const users : User[] = await res.json();
    
    const loguser  = users.filter((x) => x.email == email).slice(0,1)

    const result : User = {
      id : loguser[0].id,
      email : loguser[0].email,
      password : loguser[0].password,
      name : loguser[0].name,
    }

    console.log('loguser', result)
    return result
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}