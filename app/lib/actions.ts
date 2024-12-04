'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
      
      const amountInCents = amount * 100;
      const date = new Date().toISOString().split('T')[0];
      
    try {
      let response = await fetch('https://674e56a5635bad45618e4e77.mockapi.io/invoice', {
        method: 'POST',
        body: JSON.stringify({
            id: customerId,
            amount: amountInCents,
            status: status,
            date : date
        }),
        headers: {
            'Content-type': 'application/json'
        }})

        response = await response.json()
    } catch (error) {
      return {
        message: 'Error: Failed to Create Invoice.',
      };
    }
        
        revalidatePath('/dashboard/invoices');
        redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
 
// ...
 
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status')==null?'pending':formData.get('status')
  });
 
  const amountInCents = amount * 100;
 
  try {
        const updateurl = 'https://674e56a5635bad45618e4e77.mockapi.io/invoice/'+ customerId;
        let response = await fetch(updateurl, {
        method: 'PUT',
        body: JSON.stringify({
            amount: amountInCents,
            status: status,
        }),
        headers: {
            'Content-type': 'application/json'
        }})
        response = await response.json()
  } catch (error) {
    return {
      message: 'Error: Failed to update Invoice.',
    };
  }
  
     
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {
  
  const updateurl = 'https://674e56a5635bad45618e4e77.mockapi.io/invoice/'+ id;
    try {
      let response = await fetch(updateurl, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        }})

        response = await response.json()
    } catch (error) {
      return {
        message: 'Error: Failed to update Invoice.',
      };
    }
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}