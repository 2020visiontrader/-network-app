-- Add interaction tracking and reminder functionality

-- Create enum type for reminder frequency
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_enum') THEN
    CREATE TYPE reminder_enum AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
  END IF;
END;
$$;

-- Update contacts table to use enum
ALTER TABLE contacts 
  ALTER COLUMN reminder_frequency TYPE reminder_enum 
  USING reminder_frequency::reminder_enum;

-- Create interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type TEXT, -- e.g., call, lunch, dm, zoom
  notes TEXT,
  interaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_date ON interactions(interaction_date);

-- Enable RLS on interactions table
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for interactions
CREATE POLICY "Users can manage their own interactions"
ON interactions FOR ALL 
USING (auth.uid() = user_id);

-- Function to update last_interaction_date
CREATE OR REPLACE FUNCTION update_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts
  SET last_interaction_date = NEW.interaction_date
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating last_interaction_date
CREATE TRIGGER trigger_update_last_interaction
AFTER INSERT ON interactions
FOR EACH ROW
EXECUTE FUNCTION update_last_interaction();

-- Create view for contacts that need interaction
CREATE OR REPLACE VIEW contacts_due_for_nudge AS
SELECT 
  c.*,
  u.email as owner_email,
  u.full_name as owner_name,
  CASE
    WHEN reminder_frequency = 'weekly' THEN last_interaction_date + INTERVAL '7 days'
    WHEN reminder_frequency = 'monthly' THEN last_interaction_date + INTERVAL '1 month'
    WHEN reminder_frequency = 'quarterly' THEN last_interaction_date + INTERVAL '3 months'
    WHEN reminder_frequency = 'yearly' THEN last_interaction_date + INTERVAL '1 year'
  END as next_interaction_due,
  CASE
    WHEN reminder_frequency = 'weekly' THEN last_interaction_date <= CURRENT_DATE - INTERVAL '7 days'
    WHEN reminder_frequency = 'monthly' THEN last_interaction_date <= CURRENT_DATE - INTERVAL '1 month'
    WHEN reminder_frequency = 'quarterly' THEN last_interaction_date <= CURRENT_DATE - INTERVAL '3 months'
    WHEN reminder_frequency = 'yearly' THEN last_interaction_date <= CURRENT_DATE - INTERVAL '1 year'
  END as is_overdue
FROM contacts c
JOIN users u ON c.owner_id = u.id
WHERE 
  c.last_interaction_date IS NOT NULL 
  AND c.reminder_frequency IS NOT NULL;

-- Function to get contacts due for nudge
CREATE OR REPLACE FUNCTION get_due_contacts(user_id UUID)
RETURNS TABLE (
  contact_id UUID,
  contact_name TEXT,
  last_interaction_date DATE,
  days_overdue INTEGER,
  reminder_frequency reminder_enum
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as contact_id,
    c.contact_name,
    c.last_interaction_date,
    EXTRACT(DAY FROM (CURRENT_DATE - c.last_interaction_date))::INTEGER as days_overdue,
    c.reminder_frequency
  FROM contacts_due_for_nudge c
  WHERE c.owner_id = user_id AND c.is_overdue = true
  ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;
