-- Subscriptions table: tracks user's current plan and Paddle billing state
CREATE TABLE public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    tier text NOT NULL DEFAULT 'free',
    status text NOT NULL DEFAULT 'active',
    paddle_subscription_id text,
    paddle_customer_id text,
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions FOR ALL
TO service_role
USING (true);

-- Usage counters table: tracks free tier limits per user
CREATE TABLE public.usage_counters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    plans_this_month integer NOT NULL DEFAULT 0,
    coach_messages_today integer NOT NULL DEFAULT 0,
    missions_today integer NOT NULL DEFAULT 0,
    applications_today integer NOT NULL DEFAULT 0,
    daily_reset_at timestamptz,
    monthly_reset_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.usage_counters TO authenticated;
GRANT ALL ON public.usage_counters TO service_role;

ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.usage_counters FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
ON public.usage_counters FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage"
ON public.usage_counters FOR ALL
TO service_role
USING (true);

-- Auto-update timestamps function (reusing if exists, creating if not)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usage_counters_updated_at
BEFORE UPDATE ON public.usage_counters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to get or create usage counters for a user
CREATE OR REPLACE FUNCTION public.get_or_create_usage_counters(_user_id uuid)
RETURNS public.usage_counters
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    row public.usage_counters;
    now_ts timestamptz := now();
    today_start timestamptz := date_trunc('day', now_ts);
    month_start timestamptz := date_trunc('month', now_ts);
BEGIN
    SELECT * INTO row FROM public.usage_counters WHERE user_id = _user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.usage_counters (user_id, daily_reset_at, monthly_reset_at)
        VALUES (_user_id, today_start, month_start)
        RETURNING * INTO row;
    ELSE
        -- Reset daily counters if needed
        IF row.daily_reset_at IS NULL OR row.daily_reset_at < today_start THEN
            row.coach_messages_today := 0;
            row.missions_today := 0;
            row.applications_today := 0;
            row.daily_reset_at := today_start;
        END IF;
        -- Reset monthly counters if needed
        IF row.monthly_reset_at IS NULL OR row.monthly_reset_at < month_start THEN
            row.plans_this_month := 0;
            row.monthly_reset_at := month_start;
        END IF;
        UPDATE public.usage_counters SET
            coach_messages_today = row.coach_messages_today,
            missions_today = row.missions_today,
            applications_today = row.applications_today,
            plans_this_month = row.plans_this_month,
            daily_reset_at = row.daily_reset_at,
            monthly_reset_at = row.monthly_reset_at
        WHERE id = row.id;
    END IF;
    
    RETURN row;
END;
$$;