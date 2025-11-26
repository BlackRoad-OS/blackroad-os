using System.Text;
using UnityEngine;
using UnityEngine.UI;

namespace BlackRoad.Worldbuilder.Quests
{
    /// <summary>
    /// Minimal quest log: displays active quests and objective progress.
    /// Can be placed in the Archive panel or desktop window.
    /// </summary>
    public class QuestLogUI : MonoBehaviour
    {
        [SerializeField] private QuestTracker tracker;
        [SerializeField] private Text logText;
        [SerializeField] private float refreshInterval = 2f;

        private float _timer;

        private void Start()
        {
            if (tracker == null)
            {
                var player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                    tracker = player.GetComponent<QuestTracker>();
            }
        }

        private void Update()
        {
            _timer += Time.deltaTime;
            if (_timer >= refreshInterval)
            {
                _timer = 0f;
                Refresh();
            }
        }

        public void Refresh()
        {
            if (logText == null || tracker == null)
                return;

            var sb = new StringBuilder();
            var quests = tracker.ActiveQuests;

            if (quests == null || quests.Count == 0)
            {
                logText.text = "No active quests.";
                return;
            }

            foreach (var qs in quests)
            {
                if (qs.quest == null) continue;

                sb.AppendLine(qs.quest.title);
                if (qs.quest.objectives != null)
                {
                    for (int i = 0; i < qs.quest.objectives.Length; i++)
                    {
                        var obj = qs.quest.objectives[i];
                        int prog = qs.objectiveProgress[i];
                        sb.AppendLine($"  - {obj.description} [{prog}/{obj.requiredCount}]");
                    }
                }

                sb.AppendLine();
            }

            logText.text = sb.ToString();
        }
    }
}
