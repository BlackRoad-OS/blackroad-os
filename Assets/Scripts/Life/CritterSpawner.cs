using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Life
{
    /// <summary>
    /// Spawns a number of CritterAgent instances on a Terrain,
    /// obeying basic height & slope limits so they don't spawn on cliffs.
    /// </summary>
    public class CritterSpawner : MonoBehaviour
    {
        [Header("Terrain")]
        [SerializeField] private Terrain targetTerrain;

        [Header("Critter")]
        [SerializeField] private CritterAgent critterPrefab;
        [SerializeField] private int count = 20;

        [Header("Placement")]
        [Range(0f, 1f)]
        [SerializeField] private float minHeight = 0f;
        [Range(0f, 1f)]
        [SerializeField] private float maxHeight = 1f;
        [Range(0f, 90f)]
        [SerializeField] private float maxSlope = 35f;

        [SerializeField] private int randomSeed = 2025;

        private TerrainData _terrainData;
        private Vector3 _terrainPos;

        private void OnValidate()
        {
            if (targetTerrain == null)
                targetTerrain = GetComponent<Terrain>();
        }

        [ContextMenu("Spawn Critters")]
        public void SpawnCritters()
        {
            if (targetTerrain == null || critterPrefab == null)
            {
                Debug.LogError("[CritterSpawner] Missing terrain or critterPrefab.");
                return;
            }

            _terrainData = targetTerrain.terrainData;
            _terrainPos = targetTerrain.transform.position;

            Random.InitState(randomSeed);

            int spawned = 0;
            int attempts = 0;
            const int maxAttempts = 5000;

            while (spawned < count && attempts < maxAttempts)
            {
                attempts++;

                float rx = Random.value;
                float rz = Random.value;

                float height = _terrainData.GetInterpolatedHeight(rx, rz);
                float worldHeight = height + _terrainPos.y;

                float normHeight = Mathf.InverseLerp(
                    _terrainData.bounds.min.y + _terrainPos.y,
                    _terrainData.bounds.max.y + _terrainPos.y,
                    worldHeight
                );

                if (normHeight < minHeight || normHeight > maxHeight)
                    continue;

                Vector3 normal = _terrainData.GetInterpolatedNormal(rx, rz);
                float slope = Vector3.Angle(normal, Vector3.up);
                if (slope > maxSlope)
                    continue;

                float worldX = _terrainPos.x + rx * _terrainData.size.x;
                float worldZ = _terrainPos.z + rz * _terrainData.size.z;
                Vector3 pos = new Vector3(worldX, worldHeight, worldZ);

                var critter = Instantiate(critterPrefab, pos, Quaternion.identity, transform);
                spawned++;
            }

            Debug.Log($"[CritterSpawner] Spawned {spawned}/{count} critters.");
        }
    }
}
