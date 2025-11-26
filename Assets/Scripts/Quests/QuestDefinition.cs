using UnityEngine;
using BlackRoad.Worldbuilder.Items;

namespace BlackRoad.Worldbuilder.Quests
{
    /// <summary>
    /// ScriptableObject defining a quest and its objectives.
    /// </summary>
    [CreateAssetMenu(
        fileName = "QuestDefinition",
        menuName = "BlackRoad/Worldbuilder/QuestDefinition",
        order = 0)]
    public class QuestDefinition : ScriptableObject
    {
        public enum ObjectiveType
        {
            FeedCritter,
            CollectItem,
            BuildStructure,
            VisitLocation
        }

        [System.Serializable]
        public class Objective
        {
            [TextArea]
            public string description;

            public ObjectiveType type;
            public ItemDefinition item; // for CollectItem, optionally for FeedCritter
            public int requiredCount = 1;

            [Tooltip("Optional target position for VisitLocation objectives.")]
            public Vector3 targetPosition;
            [Tooltip("Radius in which the player must be to count as visited.")]
            public float visitRadius = 5f;
        }

        [Header("Quest Info")]
        public string questId = "quest.feed-herd-01";
        public string title = "Feed the Herd";
        [TextArea] public string description;

        [Header("Objectives")]
        public Objective[] objectives;
    }
}
