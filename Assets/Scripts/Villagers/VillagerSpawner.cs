using UnityEngine;

namespace BlackRoad.Worldbuilder.Villagers
{
    /// <summary>
    /// Spawns villagers at each provided home anchor, optionally pairing them
    /// with matching work anchors by index.
    /// </summary>
    public class VillagerSpawner : MonoBehaviour
    {
        [Header("Refs")]
        [SerializeField] private VillagerAgent villagerPrefab;
        [SerializeField] private VillagerSchedule defaultSchedule;

        [Header("Anchors")]
        [SerializeField] private Transform[] homeAnchors;
        [SerializeField] private Transform[] workAnchors;

        private void Reset()
        {
            // Try to auto-find anchors in children
            homeAnchors = new Transform[0];
            workAnchors = new Transform[0];
        }

        [ContextMenu("Spawn Villagers")]
        public void SpawnVillagers()
        {
            if (villagerPrefab == null)
            {
                Debug.LogError("[VillagerSpawner] No villagerPrefab assigned.");
                return;
            }

            for (int i = 0; i < homeAnchors.Length; i++)
            {
                Transform home = homeAnchors[i];
                if (home == null) continue;

                // Slight random offset
                Vector3 pos = home.position + new Vector3(
                    Random.Range(-0.5f, 0.5f),
                    0f,
                    Random.Range(-0.5f, 0.5f));

                var villager = Instantiate(villagerPrefab, pos, Quaternion.identity, transform);

                var agent = villager;
                agent.HomeAnchor = home;

                if (i < workAnchors.Length)
                {
                    agent.WorkAnchor = workAnchors[i];
                }

                if (agent.Schedule == null && defaultSchedule != null)
                {
                    agent.Schedule = defaultSchedule;
                }
            }

            Debug.Log($"[VillagerSpawner] Spawned {homeAnchors.Length} villagers.");
        }
    }
}
