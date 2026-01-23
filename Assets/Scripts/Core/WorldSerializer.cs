using System;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using BlackRoad.Worldbuilder.Building;

namespace BlackRoad.Worldbuilder.Core
{
    /// <summary>
    /// Saves and loads WorldGrid blocks to JSON file.
    /// Press F5 to save, F9 to load (default slot "slot1").
    /// Serializes grid positions and block IDs.
    /// </summary>
    public class WorldSerializer : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private WorldGrid worldGrid;
        [SerializeField] private BlockDatabase blockDatabase;

        [Header("Save Settings")]
        [SerializeField] private string slotName = "slot1";
        [SerializeField] private string folderName = "WorldSaves";

        [Header("Input")]
        [SerializeField] private KeyCode saveKey = KeyCode.F5;
        [SerializeField] private KeyCode loadKey = KeyCode.F9;

        [Serializable]
        private class BlockData
        {
            public string blockId;
            public int gridX, gridY, gridZ;
        }

        [Serializable]
        private class WorldSaveData
        {
            public BlockData[] blocks;
            public float cellSize;
        }

        private string SaveDirectory =>
            Path.Combine(Application.persistentDataPath, folderName);

        private string SavePath =>
            Path.Combine(SaveDirectory, $"{slotName}.json");

        private void Start()
        {
            if (worldGrid == null)
                worldGrid = FindObjectOfType<WorldGrid>();

            if (blockDatabase == null && Core.GameManager.Instance != null)
                blockDatabase = Core.GameManager.Instance.blockDatabase;
        }

        private void Update()
        {
            // F5 to save
            if (UnityEngine.Input.GetKeyDown(saveKey))
            {
                Save(slotName);
            }

            // F9 to load
            if (UnityEngine.Input.GetKeyDown(loadKey))
            {
                Load(slotName);
            }
        }

        /// <summary>
        /// Save the current world grid to a JSON file
        /// </summary>
        [ContextMenu("Save World")]
        public void Save(string slot)
        {
            if (worldGrid == null)
            {
                Debug.LogError("[WorldSerializer] No WorldGrid assigned.");
                return;
            }

            if (blockDatabase == null)
            {
                Debug.LogError("[WorldSerializer] No BlockDatabase assigned.");
                return;
            }

            var allBlocks = worldGrid.GetAllBlocks();
            var blockDataList = new List<BlockData>();

            foreach (var kvp in allBlocks)
            {
                Vector3Int gridPos = kvp.Key;
                GameObject blockObj = kvp.Value;

                if (blockObj == null)
                    continue;

                // Try to find the block type by comparing prefabs
                // This is a simple approach - in production you'd store the block type reference
                string blockId = FindBlockIdFromPrefab(blockObj);
                if (string.IsNullOrEmpty(blockId))
                    continue;

                blockDataList.Add(new BlockData
                {
                    blockId = blockId,
                    gridX = gridPos.x,
                    gridY = gridPos.y,
                    gridZ = gridPos.z
                });
            }

            var saveData = new WorldSaveData
            {
                blocks = blockDataList.ToArray(),
                cellSize = worldGrid.cellSize
            };

            string json = JsonUtility.ToJson(saveData, true);

            if (!Directory.Exists(SaveDirectory))
            {
                Directory.CreateDirectory(SaveDirectory);
            }

            string savePath = Path.Combine(SaveDirectory, $"{slot}.json");
            File.WriteAllText(savePath, json);

            Debug.Log($"[WorldSerializer] Saved {blockDataList.Count} blocks to {savePath}");
        }

        /// <summary>
        /// Load a saved world from JSON file
        /// </summary>
        [ContextMenu("Load World")]
        public void Load(string slot)
        {
            if (worldGrid == null)
            {
                Debug.LogError("[WorldSerializer] No WorldGrid assigned.");
                return;
            }

            if (blockDatabase == null)
            {
                Debug.LogError("[WorldSerializer] No BlockDatabase assigned.");
                return;
            }

            string savePath = Path.Combine(SaveDirectory, $"{slot}.json");

            if (!File.Exists(savePath))
            {
                Debug.LogWarning($"[WorldSerializer] No save file found at {savePath}");
                return;
            }

            string json = File.ReadAllText(savePath);
            var saveData = JsonUtility.FromJson<WorldSaveData>(json);

            if (saveData == null || saveData.blocks == null)
            {
                Debug.LogError("[WorldSerializer] Failed to parse save file.");
                return;
            }

            // Clear existing world
            worldGrid.ClearAll();

            // Restore cell size if it was saved
            if (saveData.cellSize > 0)
            {
                worldGrid.cellSize = saveData.cellSize;
            }

            // Place all saved blocks
            int loadedCount = 0;
            foreach (var blockData in saveData.blocks)
            {
                BlockType blockType = blockDatabase.Get(blockData.blockId);
                if (blockType == null)
                {
                    Debug.LogWarning($"[WorldSerializer] Block type '{blockData.blockId}' not found in database.");
                    continue;
                }

                Vector3Int gridPos = new Vector3Int(blockData.gridX, blockData.gridY, blockData.gridZ);
                worldGrid.PlaceBlock(gridPos, blockType);
                loadedCount++;
            }

            Debug.Log($"[WorldSerializer] Loaded {loadedCount} blocks from {savePath}");
        }

        /// <summary>
        /// Find block ID by comparing with database prefabs
        /// This is a simple implementation - consider storing block type reference on GameObjects
        /// </summary>
        private string FindBlockIdFromPrefab(GameObject instance)
        {
            if (blockDatabase == null || blockDatabase.blocks == null)
                return null;

            // Compare by name (simple approach)
            string instanceName = instance.name.Replace("(Clone)", "").Trim();

            foreach (var blockType in blockDatabase.blocks)
            {
                if (blockType != null && blockType.prefab != null)
                {
                    string prefabName = blockType.prefab.name;
                    if (instanceName == prefabName)
                    {
                        return blockType.blockId;
                    }
                }
            }

            return null;
        }
    }
}
