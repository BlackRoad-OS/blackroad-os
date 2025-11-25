using System.Text;
using UnityEngine;
using UnityEngine.UI;
using BlackRoad.Worldbuilder.Identity;

namespace BlackRoad.Worldbuilder.Archive
{
    /// <summary>
    /// Displays a simple list of all registered identities in the world.
    /// Intended to sit under the Archive panel.
    /// </summary>
    public class IdentityListUI : MonoBehaviour
    {
        [SerializeField] private Text listText;
        [SerializeField] private bool groupByType = true;

        [Header("Refresh")]
        [SerializeField] private float refreshInterval = 2f;

        private float _timer;

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
            if (listText == null) return;
            var registry = WorldIdentityRegistry.Instance;
            if (registry == null)
            {
                listText.text = "No registry found.";
                return;
            }

            var ids = registry.Identities;
            if (ids == null || ids.Count == 0)
            {
                listText.text = "No entities registered.";
                return;
            }

            var sb = new StringBuilder();

            if (groupByType)
            {
                foreach (WorldIdentity.EntityType type in System.Enum.GetValues(typeof(WorldIdentity.EntityType)))
                {
                    bool any = false;
                    foreach (var id in ids)
                    {
                        if (id == null || id.Type != type) continue;
                        if (!any)
                        {
                            any = true;
                            sb.AppendLine($"== {type} ==");
                        }

                        sb.AppendLine($"- {id.DisplayName}  ({id.UniqueId.Substring(0, 6)}...)");
                    }

                    if (any) sb.AppendLine();
                }
            }
            else
            {
                foreach (var id in ids)
                {
                    if (id == null) continue;
                    sb.AppendLine($"{id.Type}: {id.DisplayName} ({id.UniqueId.Substring(0, 6)}...)");
                }
            }

            listText.text = sb.ToString();
        }
    }
}
