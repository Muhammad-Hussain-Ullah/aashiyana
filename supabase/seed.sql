-- =====================================================================
-- Aashiyana.pk - seed data (converted from mockdata.ts)
-- Run AFTER schema.sql.
-- =====================================================================

-- Areas -----------------------------------------------------------------
insert into public.areas (name, slug, city, image_url, is_popular) values
  ('Gulshan-e-Iqbal',   'gulshan-e-iqbal',   'Karachi', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=85', true),
  ('DHA Phase 6',       'dha-phase-6',       'Karachi', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=85', true),
  ('Clifton',           'clifton',           'Karachi', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', true),
  ('North Nazimabad',   'north-nazimabad',   'Karachi', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85', true),
  ('Gulistan-e-Jauhar', 'gulistan-e-jauhar', 'Karachi', null, false);

-- Universities ----------------------------------------------------------
insert into public.universities (name) values
  ('University of Karachi'),
  ('Institute of Business Administration'),
  ('NED University of Engineering & Technology'),
  ('SZABIST'),
  ('Bahria University Karachi');

-- Amenities (name + lucide icon) ---------------------------------------
insert into public.amenities (name, icon) values
  ('Wi-Fi',        'wifi'),
  ('Backup power', 'zap'),
  ('Laundry',      'washing-machine'),
  ('Study lounge', 'book-open'),
  ('Study room',   'book-open'),
  ('Security',     'shield-check'),
  ('Meals',        'utensils'),
  ('AC rooms',     'snowflake'),
  ('Gym',          'dumbbell'),
  ('Parking',      'car'),
  ('Kitchen',      'chef-hat'),
  ('CCTV',         'camera'),
  ('Rooftop',      'sun'),
  ('Gaming room',  'gamepad-2'),
  ('Water backup', 'droplets');

-- Hostels ---------------------------------------------------------------
insert into public.hostels
  (slug, name, description, gender, address, area_id, university_id, is_featured, is_verified, status)
select v.slug, v.name, v.description, v.gender::public.gender_eligibility, v.address,
       a.id, u.id, v.featured, v.verified, 'approved'::public.moderation_status
from (values
  ('greenview-gulshan', 'Greenview Residences',
   'A calm, thoughtfully managed residence for students who want the ease of a home base close to campus. Our common spaces are designed for focus, connection, and a little breathing room.',
   'Women', 'Block 13-D, University Road, Gulshan-e-Iqbal', 'Gulshan-e-Iqbal', 'University of Karachi', true, true),
  ('campus-corner-dha', 'Campus Corner DHA',
   'A modern, social space in the heart of DHA. Easy access to IBA, cafes, and the city’s best weekend spots, with all the essentials covered.',
   'All', '26th Street, Phase 6, DHA', 'DHA Phase 6', 'Institute of Business Administration', true, true),
  ('the-study-house', 'The Study House',
   'A focused, friendly hostel that keeps things simple: a good desk, a reliable internet connection, and a supportive community of students.',
   'Men', 'Block H, North Nazimabad', 'North Nazimabad', 'NED University of Engineering & Technology', true, true),
  ('coastal-living-clifton', 'Coastal Living Clifton',
   'A sunny, characterful home near the sea, with a beautiful rooftop and a community that feels more like a shared apartment than a hostel.',
   'Women', 'Block 2, Clifton, Karachi', 'Clifton', 'SZABIST', false, true),
  ('uni-view-gulistan', 'Uni View Homes',
   'An easygoing residence with excellent transport links and everything you need for a comfortable semester.',
   'All', 'Block 14, Gulistan-e-Jauhar', 'Gulistan-e-Jauhar', 'Bahria University Karachi', false, true),
  ('nipa-student-living', 'NIPA Student Living',
   'A lively student community with plenty of room to study, unwind, and meet people from universities across Karachi.',
   'Men', 'Block 10, Gulshan-e-Iqbal', 'Gulshan-e-Iqbal', 'Institute of Business Administration', false, true)
) as v(slug, name, description, gender, address, area, university, featured, verified)
join public.areas a        on a.name = v.area
join public.universities u on u.name = v.university;

-- Photos (first photo in each list is the cover) ------------------------
insert into public.hostel_photos (hostel_id, url, alt_text, is_cover, sort_order)
select h.id,
       'https://images.unsplash.com/' || p.photo || '?auto=format&fit=crop&w=1200&q=85',
       h.name || ' - photo ' || p.ord,
       (p.ord = 1),
       (p.ord - 1)::int
from (values
  ('greenview-gulshan',      array['photo-1522708323590-d24dbb6b0267','photo-1505693416388-ac5ce068fe85','photo-1554995207-c18c203602cb']),
  ('campus-corner-dha',      array['photo-1560185008-b033106af5c3','photo-1524758631624-e2822e304c36','photo-1560448204-e02f11c3d0e2']),
  ('the-study-house',        array['photo-1540518614846-7eded433c457','photo-1497366811353-6870744d04b2','photo-1524758631624-e2822e304c36']),
  ('coastal-living-clifton', array['photo-1600607687920-4e2a09cf159d','photo-1600566753190-17f0baa2a6c3','photo-1600607687939-ce8a6c25118c']),
  ('uni-view-gulistan',      array['photo-1505693416388-ac5ce068fe85','photo-1505693550660-9d2cd93b3d74','photo-1586023492125-27b2c045efd7']),
  ('nipa-student-living',    array['photo-1497366754035-f200968a6e72','photo-1497366216548-37526070297c','photo-1513694203232-719a280e022f'])
) as v(slug, photos)
join public.hostels h on h.slug = v.slug
cross join lateral unnest(v.photos) with ordinality as p(photo, ord);

-- Rooms -----------------------------------------------------------------
insert into public.rooms (hostel_id, type, rent, available, total, description)
select h.id, v.type::public.room_type, v.rent, v.available, v.total, v.description
from (values
  ('greenview-gulshan',      'Single', 28000, 2,  8, 'Bright private room with a study desk and wardrobe.'),
  ('greenview-gulshan',      'Shared', 18500, 5, 18, 'Comfortable 2-person room with separate beds.'),
  ('campus-corner-dha',      'Single', 32000, 1, 12, 'Private room with an AC, desk, and balcony access.'),
  ('campus-corner-dha',      'Shared', 24000, 4, 14, 'Airy twin-sharing room with lots of natural light.'),
  ('the-study-house',        'Shared', 14500, 6, 24, 'Well-lit 3-person room built for students on a budget.'),
  ('the-study-house',        'Single', 22000, 1,  6, 'A private, quiet room for deep focus.'),
  ('coastal-living-clifton', 'Studio', 42000, 1,  4, 'Self-contained studio with kitchenette and private bath.'),
  ('coastal-living-clifton', 'Single', 29500, 2, 10, 'Private room with shared lounge and kitchen.'),
  ('uni-view-gulistan',      'Shared', 16500, 3, 16, 'Practical twin-sharing room near major bus routes.'),
  ('uni-view-gulistan',      'Single', 23500, 1,  5, 'Private room with attached bath.'),
  ('nipa-student-living',    'Shared', 21000, 2, 12, 'Modern double room with a shared study nook.'),
  ('nipa-student-living',    'Single', 29500, 1,  5, 'Private room with extra storage and a reading corner.')
) as v(slug, type, rent, available, total, description)
join public.hostels h on h.slug = v.slug;

-- Hostel <-> amenity links ---------------------------------------------
insert into public.hostel_amenities (hostel_id, amenity_id)
select h.id, am.id
from (values
  ('greenview-gulshan',      array['Wi-Fi','Backup power','Laundry','Study lounge','Security','Meals']),
  ('campus-corner-dha',      array['Wi-Fi','AC rooms','Gym','Parking','Security']),
  ('the-study-house',        array['Study room','Wi-Fi','Backup power','Kitchen','CCTV']),
  ('coastal-living-clifton', array['Wi-Fi','Rooftop','Laundry','Meals','Security']),
  ('uni-view-gulistan',      array['Wi-Fi','Parking','Kitchen','CCTV','Water backup']),
  ('nipa-student-living',    array['Wi-Fi','Gaming room','Laundry','Study lounge','Security'])
) as v(slug, names)
join public.hostels h on h.slug = v.slug
cross join lateral unnest(v.names) as n(name)
join public.amenities am on am.name = n.name;

-- Rules -----------------------------------------------------------------
insert into public.hostel_rules (hostel_id, rule_text, sort_order)
select h.id, r.rule, (r.ord - 1)::int
from (values
  ('greenview-gulshan', array['Quiet hours after 10:30 PM','Visitors are welcome in shared areas until 8 PM','No smoking inside the property','Monthly rent includes utilities and breakfast']),
  ('campus-corner-dha', array['Quiet hours after 11 PM','Shared kitchen closes at midnight','No smoking indoors','Minimum stay of three months']),
  ('the-study-house',   array['Study room is quiet at all times','Guests must be registered at reception','No loud music after 9 PM','Weekly cleaning included']),
  ('coastal-living-clifton', array['Rooftop closes at 10 PM','No outside food in the shared lounge','Visitors by prior notice','Utilities are billed separately']),
  ('uni-view-gulistan', array['Main gate closes at midnight','No smoking indoors','Kitchen is shared by floor','Bi-weekly linen change included']),
  ('nipa-student-living', array['Common room closes at 11 PM','Guests need an ID at reception','No parties on weekdays','Cleaning included twice a week'])
) as v(slug, rules)
join public.hostels h on h.slug = v.slug
cross join lateral unnest(v.rules) with ordinality as r(rule, ord);

-- Tags ------------------------------------------------------------------
insert into public.hostel_tags (hostel_id, tag)
select h.id, t.tag
from (values
  ('greenview-gulshan',      array['Quiet','Popular']),
  ('campus-corner-dha',      array['Near campus','New']),
  ('the-study-house',        array['Best value','Focused']),
  ('coastal-living-clifton', array['Lifestyle','Walkable']),
  ('uni-view-gulistan',      array['Affordable','Transit']),
  ('nipa-student-living',    array['Social','Top rated'])
) as v(slug, tags)
join public.hostels h on h.slug = v.slug
cross join lateral unnest(v.tags) as t(tag);

-- Sample reviews (no user_id: these are demo reviews, not tied to accounts) ----
insert into public.reviews (hostel_id, author_name, rating, title, body, stay_duration, created_at)
select h.id, v.author, v.rating, v.title, v.body, v.stay, now() - v.age::interval
from (values
  ('greenview-gulshan', 'Ayesha K.', 5, 'Feels like a real home',
   'The managers are kind, the study lounge is actually quiet, and the University Road commute is so easy. I felt comfortable from week one.',
   'Stayed 8 months', '2 weeks'),
  ('greenview-gulshan', 'Hira S.', 5, 'Very clean and secure',
   'I was nervous moving to Karachi for university, but the team made everything simple. Backup power and breakfast are a big plus.',
   'Stayed 5 months', '1 month'),
  ('greenview-gulshan', 'Maham R.', 4, 'Lovely common spaces',
   'The rooms are a little compact, but the shared areas and location make up for it. Would recommend for first-year students.',
   'Stayed 1 year', '3 months'),
  ('campus-corner-dha', 'Zain A.', 5, 'Great location for IBA',
   'The short commute is a lifesaver. The place is newer than most options nearby and the staff responds quickly.',
   'Stayed 4 months', '3 weeks'),
  ('the-study-house', 'Hamza R.', 4, 'Exactly what I needed',
   'Affordable, quiet, and reliable Wi-Fi. The study room is the reason I picked this place and it delivers.',
   'Stayed 6 months', '2 months')
) as v(slug, author, rating, title, body, stay, age)
join public.hostels h on h.slug = v.slug;

-- Quick check (should return 6 hostels with rent / rating / counts) -------------
-- select slug, area_name, starting_rent, rating, review_count, tags, amenities from public.hostel_summary;
