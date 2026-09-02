-- Remove anonymous access to customer/admin data and require explicit admin
-- membership for every back-office operation.

alter table public.admin_users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.carousel_images enable row level security;
alter table public.clubs enable row level security;
alter table public.club_products enable row level security;

-- Existing Supabase projects grant broad table privileges by default. Remove
-- them first, then add back only what each API role actually needs.
revoke all privileges on table public.admin_users from public, anon, authenticated;
revoke all privileges on table public.orders from public, anon, authenticated;
revoke all privileges on table public.order_items from public, anon, authenticated;
revoke all privileges on table public.products from public, anon, authenticated;
revoke all privileges on table public.categories from public, anon, authenticated;
revoke all privileges on table public.carousel_images from public, anon, authenticated;
revoke all privileges on table public.clubs from public, anon, authenticated;
revoke all privileges on table public.club_products from public, anon, authenticated;

grant select on table public.products to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.carousel_images to anon, authenticated;
grant select on table public.clubs to anon, authenticated;
grant select on table public.club_products to anon, authenticated;

grant insert, update, delete on table public.products to authenticated;
grant insert, update, delete on table public.categories to authenticated;
grant insert, update, delete on table public.carousel_images to authenticated;
grant insert, update, delete on table public.clubs to authenticated;
grant insert, update, delete on table public.club_products to authenticated;

grant select, update on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select on table public.admin_users to authenticated;

revoke all privileges on sequence public.admin_users_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.orders_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.order_items_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.products_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.categories_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.carousel_images_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.clubs_id_seq from public, anon, authenticated;
revoke all privileges on sequence public.club_products_id_seq from public, anon, authenticated;

grant usage, select on sequence public.products_id_seq to authenticated;
grant usage, select on sequence public.categories_id_seq to authenticated;
grant usage, select on sequence public.carousel_images_id_seq to authenticated;
grant usage, select on sequence public.clubs_id_seq to authenticated;
grant usage, select on sequence public.club_products_id_seq to authenticated;

-- Future tables and sequences in public must be exposed deliberately instead
-- of inheriting the legacy project-wide Data API grants.
alter default privileges for role postgres in schema public
  revoke all privileges on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all privileges on sequences from anon, authenticated;

-- admin_users is the server-controlled source of truth for authorization.
-- An authenticated admin may only read their own membership row. No client
-- role may create, update, or delete admin memberships.
drop policy if exists "Admins can view all" on public.admin_users;
drop policy if exists "Admins can update all" on public.admin_users;
drop policy if exists "Admins can view own membership" on public.admin_users;

create policy "Admins can view own membership"
on public.admin_users
for select
to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
  and role = 'admin'
);

-- Orders and their line items must never be visible to anonymous callers.
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Admins can view orders" on public.orders;
drop policy if exists "Admins can update orders" on public.orders;

create policy "Admins can view orders"
on public.orders
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'admin'
  )
);

create policy "Admins can update orders"
on public.orders
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'admin'
  )
);

drop policy if exists "Users can view order items" on public.order_items;
drop policy if exists "Admins can view order items" on public.order_items;

create policy "Admins can view order items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
      and role = 'admin'
  )
);

-- Public catalog reads remain available for active records. All back-office
-- reads and writes require an admin_users membership row.
drop policy if exists "Products are viewable by everyone" on public.products;
drop policy if exists "Authenticated users can view all products" on public.products;
drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated users can update products" on public.products;
drop policy if exists "Authenticated users can delete products" on public.products;

create policy "Public can view active products"
on public.products for select
to anon, authenticated
using (active = true);

create policy "Admins can view all products"
on public.products for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update products"
on public.products for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete products"
on public.products for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

drop policy if exists "Categories are viewable by everyone" on public.categories;
drop policy if exists "Authenticated users can insert categories" on public.categories;
drop policy if exists "Authenticated users can update categories" on public.categories;
drop policy if exists "Authenticated users can delete categories" on public.categories;

create policy "Public can view active categories"
on public.categories for select
to anon, authenticated
using (active = true);

create policy "Admins can view all categories"
on public.categories for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can insert categories"
on public.categories for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update categories"
on public.categories for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete categories"
on public.categories for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

drop policy if exists "Carousel images are viewable by everyone" on public.carousel_images;
drop policy if exists "Authenticated users can insert carousel images" on public.carousel_images;
drop policy if exists "Authenticated users can update carousel images" on public.carousel_images;
drop policy if exists "Authenticated users can delete carousel images" on public.carousel_images;

create policy "Public can view active carousel images"
on public.carousel_images for select
to anon, authenticated
using (active = true);

create policy "Admins can view all carousel images"
on public.carousel_images for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can insert carousel images"
on public.carousel_images for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update carousel images"
on public.carousel_images for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete carousel images"
on public.carousel_images for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

drop policy if exists "Clubs are viewable by everyone" on public.clubs;
drop policy if exists "Authenticated users can view all clubs" on public.clubs;
drop policy if exists "Authenticated users can insert clubs" on public.clubs;
drop policy if exists "Authenticated users can update clubs" on public.clubs;
drop policy if exists "Authenticated users can delete clubs" on public.clubs;

create policy "Public can view active clubs"
on public.clubs for select
to anon, authenticated
using (active = true);

create policy "Admins can view all clubs"
on public.clubs for select
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can insert clubs"
on public.clubs for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update clubs"
on public.clubs for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete clubs"
on public.clubs for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

drop policy if exists "Club products are viewable by everyone" on public.club_products;
drop policy if exists "Authenticated users can insert club products" on public.club_products;
drop policy if exists "Authenticated users can update club products" on public.club_products;
drop policy if exists "Authenticated users can delete club products" on public.club_products;

create policy "Public can view club products"
on public.club_products for select
to anon, authenticated
using (true);

create policy "Admins can insert club products"
on public.club_products for insert
to authenticated
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can update club products"
on public.club_products for update
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'))
with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

create policy "Admins can delete club products"
on public.club_products for delete
to authenticated
using (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin'));

-- Product images remain publicly readable, but only registered admins may
-- mutate objects in this bucket.
drop policy if exists "Public can view product images" on storage.objects;
drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists "Authenticated users can update product images" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;

create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin')
);

create policy "Admins can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin')
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin')
);

create policy "Admins can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_users where user_id = (select auth.uid()) and role = 'admin')
);
