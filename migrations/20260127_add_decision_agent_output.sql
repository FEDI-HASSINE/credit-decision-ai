-- Allow storing Decision agent outputs in agent_outputs.

ALTER TABLE agent_outputs
  DROP CONSTRAINT IF EXISTS agent_outputs_agent_name_check;

ALTER TABLE agent_outputs
  ADD CONSTRAINT agent_outputs_agent_name_check
  CHECK (agent_name IN ('document', 'image', 'behavior', 'similarity', 'fraud', 'decision'));
