-- Backfill device_id from class_name scope for classes
UPDATE classes
SET device_id = substring(class_name from '\[\[(.+?)\]\]')
WHERE device_id IS NULL AND class_name LIKE '[[%]]%';

-- Backfill device_id for students based on their class's device_id
UPDATE students s
SET device_id = c.device_id
FROM classes c
WHERE s.class_id = c.id AND s.device_id IS NULL AND c.device_id IS NOT NULL;

-- Drop existing permissive RLS policies on classes
DROP POLICY IF EXISTS "Allow public delete access on classes" ON classes;
DROP POLICY IF EXISTS "Allow public insert access on classes" ON classes;
DROP POLICY IF EXISTS "Allow public read access on classes" ON classes;
DROP POLICY IF EXISTS "Allow public update access on classes" ON classes;

-- Create device-isolated RLS policies for classes
CREATE POLICY "Device-isolated class select"
  ON classes FOR SELECT
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Device-isolated class insert"
  ON classes FOR INSERT
  WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id' AND device_id IS NOT NULL);

CREATE POLICY "Device-isolated class update"
  ON classes FOR UPDATE
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Device-isolated class delete"
  ON classes FOR DELETE
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

-- Drop existing permissive RLS policies on students
DROP POLICY IF EXISTS "Allow public delete access on students" ON students;
DROP POLICY IF EXISTS "Allow public insert access on students" ON students;
DROP POLICY IF EXISTS "Allow public read access on students" ON students;
DROP POLICY IF EXISTS "Allow public update access on students" ON students;

-- Create device-isolated RLS policies for students
CREATE POLICY "Device-isolated student select"
  ON students FOR SELECT
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Device-isolated student insert"
  ON students FOR INSERT
  WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id' AND device_id IS NOT NULL);

CREATE POLICY "Device-isolated student update"
  ON students FOR UPDATE
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Device-isolated student delete"
  ON students FOR DELETE
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');