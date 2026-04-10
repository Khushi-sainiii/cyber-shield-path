
CREATE OR REPLACE FUNCTION public.get_risk_level(score INTEGER)
RETURNS risk_level
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN score <= 30 THEN 'low'::risk_level
    WHEN score <= 70 THEN 'medium'::risk_level
    ELSE 'high'::risk_level
  END
$$;
