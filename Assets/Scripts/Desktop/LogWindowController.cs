using System.Text;
using UnityEngine;
using UnityEngine.UI;
using BlackRoad.Worldbuilder.Archive;

namespace BlackRoad.Worldbuilder.Desktop
{
    /// <summary>
    /// Example app window that displays a rolling log of system info.
    /// </summary>
    public class LogWindowController : MonoBehaviour
    {
        [SerializeField] private Text logText;
        [SerializeField] private int maxLines = 100;
        [SerializeField] private float updateInterval = 2f;

        private float _timer;
        private readonly StringBuilder _sb = new StringBuilder();

        private void OnEnable()
        {
            _sb.Clear();
            AppendLine("[System Log] Session started.");
        }

        private void Update()
        {
            _timer += Time.deltaTime;
            if (_timer >= updateInterval)
            {
                _timer = 0f;
                AppendStatusLine();
            }
        }

        private void AppendStatusLine()
        {
            var stats = WorldStatsTracker.Instance;
            if (stats == null) return;

            string time = stats.GetTimeSummary();
            string pop = stats.GetPopulationSummary();
            string cosmos = stats.GetCosmosSummary();

            AppendLine($"{time} | {pop} | {cosmos}");
        }

        private void AppendLine(string line)
        {
            _sb.AppendLine(line);

            // trim lines
            var text = _sb.ToString();
            var lines = text.Split('\n');
            if (lines.Length > maxLines)
            {
                int start = lines.Length - maxLines;
                _sb.Clear();
                for (int i = start; i < lines.Length; i++)
                {
                    if (!string.IsNullOrEmpty(lines[i]))
                        _sb.AppendLine(lines[i]);
                }
            }

            if (logText != null)
                logText.text = _sb.ToString();
        }
    }
}
