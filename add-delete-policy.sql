-- Add missing DELETE policy for customers table
CREATE POLICY "Authenticated users can delete customers" ON public.customers
    FOR DELETE USING (auth.role() = 'authenticated'); 