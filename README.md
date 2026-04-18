This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Supabase Setup (Optional but recommended for Admin Panel)

To store test results and view them in the `/admin` dashboard, you need to set up a free Supabase project.

1. Go to [Supabase](https://supabase.com/) and click "Start your project".
2. Create a new project and wait for the database to provision.
3. Once ready, go to the **SQL Editor** in the left sidebar and run this query to create the table:

```sql
create table test_results (
  id uuid default uuid_generate_v4() primary key,
  config jsonb not null,
  answers jsonb not null,
  timeSpent jsonb not null,
  timeRemaining integer not null,
  questionIds jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Optional: Enable Row Level Security (RLS) policies if you want to secure it further,
-- but for a simple mock test dump, you can disable RLS or add a policy that allows inserts:
-- create policy "Enable insert for all users" on "public"."test_results" as PERMISSIVE for INSERT to public with check (true);
-- create policy "Enable read access for all users" on "public"."test_results" as PERMISSIVE for SELECT to public using (true);
```

4. Next, go to **Project Settings -> API**.
5. Copy the **Project URL** and the **anon `public` API Key**.
6. In your local project, create a `.env.local` file and add them:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Deployment Instructions

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Sign up or log in to [Vercel](https://vercel.com).
3. Click on "Add New Project" and import your repository.
4. Before clicking Deploy, open the **Environment Variables** section.
5. Add the following variables that you got from Supabase:
   * Key: `NEXT_PUBLIC_SUPABASE_URL` | Value: (Your Supabase URL)
   * Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Value: (Your Supabase Anon Key)
6. Vercel will automatically detect that it's a Next.js project because of `vercel.json` and standard Next.js files.
7. Click "Deploy". The build process will start, and within a minute or two, your NEET Mock Test app will be live!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
