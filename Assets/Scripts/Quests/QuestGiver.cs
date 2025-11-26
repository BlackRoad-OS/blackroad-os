using UnityEngine;
using BlackRoad.Worldbuilder.Interaction;

namespace BlackRoad.Worldbuilder.Quests
{
    /// <summary>
    /// Simple quest giver. When the player interacts, it starts the configured quest.
    /// </summary>
    public class QuestGiver : Interactable
    {
        [Header("Quest")]
        [SerializeField] private QuestDefinition quest;

        public override void Interact(GameObject interactor)
        {
            if (quest == null)
            {
                Debug.LogWarning("[QuestGiver] No quest assigned.");
                return;
            }

            var tracker = interactor.GetComponent<QuestTracker>();
            if (tracker == null)
            {
                Debug.LogWarning("[QuestGiver] Interactor has no QuestTracker.");
                return;
            }

            tracker.StartQuest(quest);
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            var so = new UnityEditor.SerializedObject(this);
            so.FindProperty("displayName").stringValue = quest != null ? quest.title : "Quest Giver";
            so.FindProperty("verb").stringValue = "Accept";
            so.ApplyModifiedPropertiesWithoutUndo();
        }
#endif
    }
}
