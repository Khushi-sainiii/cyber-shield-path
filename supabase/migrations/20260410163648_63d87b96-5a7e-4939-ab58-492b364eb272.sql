
-- User points table
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0 CHECK (total_points >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Point history for audit trail
CREATE TABLE public.point_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Badge definitions
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  criteria_type TEXT NOT NULL,
  criteria_threshold INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS: user_points
CREATE POLICY "Users can view own points" ON public.user_points
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can upsert points" ON public.user_points
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can update points" ON public.user_points
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS: point_history
CREATE POLICY "Users can view own point history" ON public.point_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert point history" ON public.point_history
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS: badges (viewable by all authenticated)
CREATE POLICY "Badges viewable by authenticated" ON public.badges
  FOR SELECT TO authenticated
  USING (true);

-- RLS: user_badges
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert user badges" ON public.user_badges
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Timestamp trigger for user_points
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default badges
INSERT INTO public.badges (name, description, icon, criteria_type, criteria_threshold) VALUES
  ('Phishing Defender', 'Report 5 phishing emails', '🛡️', 'reports', 5),
  ('Security Champion', 'Maintain Low Risk for 7 days', '🏆', 'low_risk_days', 7),
  ('Quick Learner', 'Complete 3 training modules', '📚', 'training_completed', 3),
  ('Zero Trust Hero', 'No clicks on phishing links in a campaign', '🦸', 'zero_clicks', 1);

-- Function to award points to a user
CREATE OR REPLACE FUNCTION public.award_points(
  target_user_id UUID,
  pts INTEGER,
  action TEXT,
  descr TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
BEGIN
  -- Upsert user_points
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (target_user_id, GREATEST(0, pts))
  ON CONFLICT (user_id)
  DO UPDATE SET total_points = GREATEST(0, user_points.total_points + pts);

  SELECT total_points INTO new_total FROM public.user_points WHERE user_id = target_user_id;

  -- Record history
  INSERT INTO public.point_history (user_id, points, action_type, description)
  VALUES (target_user_id, pts, action, descr);

  RETURN new_total;
END;
$$;

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
