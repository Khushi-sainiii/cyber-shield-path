
-- Create risk level enum
CREATE TYPE public.risk_level AS ENUM ('low', 'medium', 'high');

-- Risk scores table - current score per user
CREATE TABLE public.risk_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  risk_level risk_level NOT NULL DEFAULT 'low',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Risk score history for trend analysis
CREATE TABLE public.risk_score_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level risk_level NOT NULL,
  action_type TEXT NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_score_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for risk_scores
CREATE POLICY "Users can view own risk score"
  ON public.risk_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert risk scores"
  ON public.risk_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can update risk scores"
  ON public.risk_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS policies for risk_score_history
CREATE POLICY "Users can view own risk history"
  ON public.risk_score_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert risk history"
  ON public.risk_score_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Function to calculate risk level from score
CREATE OR REPLACE FUNCTION public.get_risk_level(score INTEGER)
RETURNS risk_level
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN score <= 30 THEN 'low'::risk_level
    WHEN score <= 70 THEN 'medium'::risk_level
    ELSE 'high'::risk_level
  END
$$;

-- Function to recalculate a user's risk score from campaign_results
CREATE OR REPLACE FUNCTION public.recalculate_risk_score(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_score INTEGER := 0;
  result_row RECORD;
BEGIN
  FOR result_row IN
    SELECT email_opened, link_clicked, credentials_submitted
    FROM public.campaign_results
    WHERE user_id = target_user_id
  LOOP
    IF result_row.email_opened = true THEN
      total_score := total_score + 5;
    END IF;
    IF result_row.link_clicked = true THEN
      total_score := total_score + 20;
    END IF;
    IF result_row.credentials_submitted = true THEN
      total_score := total_score + 40;
    END IF;
  END LOOP;

  -- Clamp between 0 and 100
  total_score := GREATEST(0, LEAST(100, total_score));

  -- Upsert risk score
  INSERT INTO public.risk_scores (user_id, score, risk_level, last_updated)
  VALUES (target_user_id, total_score, get_risk_level(total_score), now())
  ON CONFLICT (user_id)
  DO UPDATE SET score = total_score, risk_level = get_risk_level(total_score), last_updated = now();

  -- Record history
  INSERT INTO public.risk_score_history (user_id, score, risk_level, action_type)
  VALUES (target_user_id, total_score, get_risk_level(total_score), 'recalculation');

  RETURN total_score;
END;
$$;

-- Trigger to auto-recalculate risk score when campaign_results change
CREATE OR REPLACE FUNCTION public.trigger_recalculate_risk()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM recalculate_risk_score(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER recalculate_risk_on_result_change
  AFTER INSERT OR UPDATE ON public.campaign_results
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_risk();

-- Enable realtime for risk_scores
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_scores;
