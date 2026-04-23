import { supabase } from '@/integrations/supabase/client';

/**
 * Centralized action handlers that affect both gamification and risk score.
 * All functions are no-ops if the user is not authenticated.
 */

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

async function logCampaignAction(field: 'email_opened' | 'link_clicked' | 'credentials_submitted', timestampField: 'opened_at' | 'clicked_at' | 'submitted_at', campaignId?: string) {
  const userId = await uid();
  if (!userId) return;

  // Find or create a "simulation" campaign result row
  let cId = campaignId;
  if (!cId) {
    // Create a generic placeholder campaign owned by the user for simulation tracking
    const { data: existing } = await supabase
      .from('campaigns')
      .select('id')
      .eq('name', 'Simulation Logs')
      .maybeSingle();

    if (existing) {
      cId = existing.id;
    } else {
      const { data: created } = await supabase
        .from('campaigns')
        .insert({
          name: 'Simulation Logs',
          campaign_type: 'phishing',
          created_by: userId,
          status: 'active',
        })
        .select('id')
        .single();
      cId = created?.id;
    }
  }
  if (!cId) return;

  await supabase.from('campaign_results').insert({
    user_id: userId,
    campaign_id: cId,
    [field]: true,
    [timestampField]: new Date().toISOString(),
  });

  // Recalculate risk
  await supabase.rpc('recalculate_risk_score', { target_user_id: userId });
}

async function awardPoints(points: number, action: string, description: string) {
  const userId = await uid();
  if (!userId) return;
  await supabase.rpc('award_points', {
    target_user_id: userId,
    pts: points,
    action,
    descr: description,
  });
}

export const userActions = {
  emailOpened: (campaignId?: string) => logCampaignAction('email_opened', 'opened_at', campaignId),
  linkClicked: async (campaignId?: string) => {
    await logCampaignAction('link_clicked', 'clicked_at', campaignId);
    await awardPoints(-10, 'phishing_clicked', 'Clicked a phishing link');
  },
  credentialsSubmitted: async (campaignId?: string) => {
    await logCampaignAction('credentials_submitted', 'submitted_at', campaignId);
    await awardPoints(-20, 'credentials_entered', 'Entered credentials on a fake page');
  },
  reportedPhishing: () => awardPoints(20, 'reported_phishing', 'Reported a phishing/smishing attempt'),
  ignoredEmail: () => awardPoints(10, 'ignored_email', 'Ignored a suspicious email'),
  trainingCompleted: (moduleId: string) => awardPoints(15, 'training_completed', `Completed training: ${moduleId}`),
  quizPassed: (moduleId: string, score: number) => awardPoints(25, 'quiz_passed', `Passed ${moduleId} quiz with ${score}%`),
};
