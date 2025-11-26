using System;
using System.Collections.Generic;
using UnityEngine;
using BlackRoad.Worldbuilder.Items;

namespace BlackRoad.Worldbuilder.Quests
{
    /// <summary>
    /// Tracks active quests for a player and updates objective progress
    /// when notified of world actions (feeding critter, collecting item, etc.).
    /// </summary>
    public class QuestTracker : MonoBehaviour
    {
        [Serializable]
        public class QuestState
        {
            public QuestDefinition quest;
            public int[] objectiveProgress;
            public bool completed;
        }

        [Header("Active Quests")]
        [SerializeField] private List<QuestState> activeQuests = new List<QuestState>();

        public IReadOnlyList<QuestState> ActiveQuests => activeQuests;

        public event Action<QuestState> OnQuestUpdated;
        public event Action<QuestState> OnQuestCompleted;

        public void StartQuest(QuestDefinition quest)
        {
            if (quest == null) return;

            // Avoid duplicates by id
            foreach (var qs in activeQuests)
            {
                if (qs.quest != null && qs.quest.questId == quest.questId)
                {
                    Debug.Log($"[QuestTracker] Quest '{quest.title}' already active.");
                    return;
                }
            }

            var state = new QuestState
            {
                quest = quest,
                completed = false,
                objectiveProgress = quest.objectives != null
                    ? new int[quest.objectives.Length]
                    : new int[0]
            };

            activeQuests.Add(state);
            Debug.Log($"[QuestTracker] Started quest: {quest.title}");
            OnQuestUpdated?.Invoke(state);
        }

        // --- Notifications from the world ---

        public void NotifyCritterFed(int count = 1)
        {
            foreach (var qs in activeQuests)
            {
                UpdateObjectives(qs, QuestDefinition.ObjectiveType.FeedCritter, null, count);
            }
        }

        public void NotifyItemCollected(ItemDefinition item, int amount)
        {
            foreach (var qs in activeQuests)
            {
                UpdateObjectives(qs, QuestDefinition.ObjectiveType.CollectItem, item, amount);
            }
        }

        public void NotifyStructureBuilt(int count = 1)
        {
            foreach (var qs in activeQuests)
            {
                UpdateObjectives(qs, QuestDefinition.ObjectiveType.BuildStructure, null, count);
            }
        }

        public void NotifyVisited(Vector3 playerPosition)
        {
            foreach (var qs in activeQuests)
            {
                if (qs.quest == null || qs.quest.objectives == null) continue;

                for (int i = 0; i < qs.quest.objectives.Length; i++)
                {
                    var obj = qs.quest.objectives[i];
                    if (obj.type != QuestDefinition.ObjectiveType.VisitLocation) continue;

                    float dist = Vector3.Distance(playerPosition, obj.targetPosition);
                    if (dist <= obj.visitRadius && qs.objectiveProgress[i] < obj.requiredCount)
                    {
                        qs.objectiveProgress[i] = obj.requiredCount;
                        CheckCompletion(qs);
                        OnQuestUpdated?.Invoke(qs);
                    }
                }
            }
        }

        // --- Internal helpers ---

        private void UpdateObjectives(
            QuestState qs,
            QuestDefinition.ObjectiveType type,
            ItemDefinition item,
            int delta)
        {
            if (qs.quest == null || qs.quest.objectives == null) return;
            if (qs.completed) return;

            bool changed = false;

            for (int i = 0; i < qs.quest.objectives.Length; i++)
            {
                var obj = qs.quest.objectives[i];
                if (obj.type != type) continue;

                if (type == QuestDefinition.ObjectiveType.CollectItem && obj.item != item)
                    continue;

                int before = qs.objectiveProgress[i];
                int after = Mathf.Clamp(
                    before + delta,
                    0,
                    obj.requiredCount
                );

                if (after != before)
                {
                    qs.objectiveProgress[i] = after;
                    changed = true;
                }
            }

            if (changed)
            {
                CheckCompletion(qs);
                OnQuestUpdated?.Invoke(qs);
            }
        }

        private void CheckCompletion(QuestState qs)
        {
            if (qs.quest == null || qs.quest.objectives == null) return;
            if (qs.completed) return;

            for (int i = 0; i < qs.quest.objectives.Length; i++)
            {
                if (qs.objectiveProgress[i] < qs.quest.objectives[i].requiredCount)
                    return;
            }

            qs.completed = true;
            Debug.Log($"[QuestTracker] Quest completed: {qs.quest.title}");
            OnQuestCompleted?.Invoke(qs);
        }
    }
}
