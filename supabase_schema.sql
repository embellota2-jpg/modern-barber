-- TABLA DE SERVICIOS
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar servicios iniciales
INSERT INTO services (name, duration, price, description) VALUES
('Corte de Cabello', 30, 2500, 'Corte premium con asesoría de imagen y lavado.'),
('Barba & Perfilado', 20, 1500, 'Arreglo de barba con toalla caliente y perfilado.'),
('Combo Barbería', 50, 3500, 'Corte de cabello y arreglo de barba completo.');

-- TABLA DE PERFILES DE USUARIO
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  loyalty_points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (true);

-- TABLA DE CITAS (APPOINTMENTS)
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  service_id UUID REFERENCES services NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para Citas
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Los usuarios pueden ver sus propias citas" ON appointments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios pueden insertar sus propias citas" ON appointments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Los administradores pueden ver y actualizar todas" ON appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
