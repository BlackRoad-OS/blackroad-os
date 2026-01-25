-- BlackRoad SaaS Performance Indexes
-- Database: blackroad-saas (c7bec6d8-42fa-49fb-9d8c-57d626dde6b9)
-- Created: 2025-01-25
-- Purpose: Optimize common query patterns for chat, CRM, agents, and billing

-- 1. Chat pagination - channel messages sorted by time
CREATE INDEX IF NOT EXISTS idx_messages_channel_time ON messages(channel_id, created_at DESC);

-- 2. Auth checks - user subscription status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);

-- 3. Dashboard - running agents per user
CREATE INDEX IF NOT EXISTS idx_agent_deployments_user_status ON agent_deployments(user_id, status);

-- 4. API key lookups - active keys only (partial index)
CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON api_keys(user_id, revoked) WHERE revoked = 0;

-- 5. CRM pipeline views - deals by contact and stage
CREATE INDEX IF NOT EXISTS idx_crm_deals_contact_stage ON deals(contact_id, stage, value DESC);

-- 6. Overdue task cron - pending tasks by deadline
CREATE INDEX IF NOT EXISTS idx_tasks_deadline_pending ON tasks(deadline, status) WHERE status IN ('pending', 'assigned', 'in_progress');

-- 7. Drip campaign automation - next action queue
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_next_action ON sequence_enrollments(next_action_at, status) WHERE status = 'active';

-- 8. Online agent routing - active agents by last seen
CREATE INDEX IF NOT EXISTS idx_agents_status_last_seen ON agents(status, last_seen DESC) WHERE status != 'offline';

-- 9. Stale presence cleanup - online users by last seen
CREATE INDEX IF NOT EXISTS idx_presence_last_seen ON presence(last_seen DESC) WHERE status = 'online';

-- 10. CRM automation matching - active triggers by type
CREATE INDEX IF NOT EXISTS idx_automations_active_trigger ON automations(trigger_type, active) WHERE active = 1;

-- 11. Agent memory retrieval - by type and importance
CREATE INDEX IF NOT EXISTS idx_agent_memories_recall ON agent_memories(agent_id, memory_type, importance DESC, last_accessed DESC);

-- 12. Billing dashboards - active instances by cost
CREATE INDEX IF NOT EXISTS idx_instances_active_cost ON instances(user_id, status, cost_incurred DESC) WHERE status = 'active';

-- 13. Agent activity logs - usage by agent and time
CREATE INDEX IF NOT EXISTS idx_tool_usage_agent_time_cost ON tool_usage(agent_id, timestamp DESC, cost DESC);

-- 14. Account-based selling - contacts by company and score
CREATE INDEX IF NOT EXISTS idx_contacts_company_score ON contacts(company_id, lead_score DESC) WHERE company_id IS NOT NULL;

-- 15. Channel discovery - by type and creation date
CREATE INDEX IF NOT EXISTS idx_channels_type_created ON channels(type, created_at DESC);

-- 16. Multi-agent routing - relationships by trust score
CREATE INDEX IF NOT EXISTS idx_agent_relationships_trust ON agent_relationships(agent_id, trust_score DESC, successful_collaborations DESC);

-- 17. Open pipeline views - deals by stage and value (excluding won/lost)
CREATE INDEX IF NOT EXISTS idx_deals_stage_value ON deals(stage, value DESC) WHERE won IS NULL;
