CREATE TABLE rooftops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_name TEXT,
  phone TEXT,
  location TEXT,
  size INTEGER,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);
