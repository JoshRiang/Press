-- Converted JSON data to SQL
CREATE TABLE IF NOT EXISTS muscles (
  id TEXT PRIMARY KEY,
  mesh_name TEXT NOT NULL,
  muscle_group TEXT
);

INSERT OR REPLACE INTO muscles (id, mesh_name, muscle_group) VALUES
('base_mannequin', 'Main Body', 'Base Manekin / Tubuh Utama (Non-Otot)'),
('back', 'Mesh_Back', 'Punggung (Umum)'),
('biceps', 'Mesh_Bicep', 'Bicep'),
('chest_bot', 'Mesh_Bottom_Chest', 'Dada Bawah'),
('calves', 'Mesh_Calf', 'Betis'),
('core', 'Mesh_Core', 'Inti / Perut'),
('forearm', 'Mesh_Forearm', 'Lengan Bawah'),
('glutes', 'Mesh_Glutes', 'Bongkong'),
('hamstring', 'Mesh_Hamstring', 'Paha Belakang'),
('head_neck', 'Mesh_Head', 'Kepala / Leher'),
('lats', 'Mesh_Lats', 'Lats / Sayap'),
('back_mid', 'Mesh_Middle_Back', 'Punggung Tengah'),
('chest_mid', 'Mesh_Middle_Chest', 'Dada Tengah'),
('quads', 'Mesh_Quads', 'Paha Depan'),
('shoulders', 'Mesh_Shoulder', 'Bahu / Deltoid'),
('traps', 'Mesh_Traps', 'Traps / Pundak'),
('triceps', 'Mesh_Tricep', 'Tricep'),
('chest_up', 'Mesh_Upper_Chest', 'Dada Atas');