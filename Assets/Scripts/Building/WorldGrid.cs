using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Grid-based storage for placed blocks in the world.
    /// Manages block placement, removal, and serialization.
    /// </summary>
    public class WorldGrid : MonoBehaviour
    {
        [Header("Grid Settings")]
        public float cellSize = 1f;

        private readonly Dictionary<Vector3Int, GameObject> _placedBlocks =
            new Dictionary<Vector3Int, GameObject>();

        /// <summary>
        /// Convert world position to grid coordinates
        /// </summary>
        public Vector3Int WorldToGrid(Vector3 worldPos)
        {
            return new Vector3Int(
                Mathf.RoundToInt(worldPos.x / cellSize),
                Mathf.RoundToInt(worldPos.y / cellSize),
                Mathf.RoundToInt(worldPos.z / cellSize)
            );
        }

        /// <summary>
        /// Convert grid coordinates to world position
        /// </summary>
        public Vector3 GridToWorld(Vector3Int gridPos)
        {
            return new Vector3(
                gridPos.x * cellSize,
                gridPos.y * cellSize,
                gridPos.z * cellSize
            );
        }

        /// <summary>
        /// Try to get the block at the specified grid position
        /// </summary>
        public bool TryGetBlock(Vector3Int gridPos, out GameObject block)
        {
            return _placedBlocks.TryGetValue(gridPos, out block);
        }

        /// <summary>
        /// Place a block at the specified grid position
        /// </summary>
        public GameObject PlaceBlock(Vector3Int gridPos, BlockType blockType)
        {
            if (blockType == null || blockType.prefab == null)
                return null;

            if (_placedBlocks.ContainsKey(gridPos))
                return _placedBlocks[gridPos];

            Vector3 worldPos = GridToWorld(gridPos);
            var instance = Instantiate(blockType.prefab, worldPos, Quaternion.identity, transform);
            _placedBlocks.Add(gridPos, instance);

            // Notify adjacent blocks of change
            NotifyAdjacentBlocks(gridPos);

            return instance;
        }

        /// <summary>
        /// Remove the block at the specified grid position
        /// </summary>
        public bool RemoveBlock(Vector3Int gridPos)
        {
            if (!_placedBlocks.TryGetValue(gridPos, out var instance))
                return false;

            _placedBlocks.Remove(gridPos);

            if (instance != null)
            {
                Destroy(instance);
            }

            // Notify adjacent blocks of change
            NotifyAdjacentBlocks(gridPos);

            return true;
        }

        /// <summary>
        /// Get all placed blocks in the grid (for serialization)
        /// Returns dictionary of grid position to GameObject
        /// </summary>
        public Dictionary<Vector3Int, GameObject> GetAllBlocks()
        {
            return new Dictionary<Vector3Int, GameObject>(_placedBlocks);
        }

        /// <summary>
        /// Clear all blocks from the grid (for loading saved worlds)
        /// </summary>
        public void ClearAll()
        {
            foreach (var kvp in _placedBlocks)
            {
                if (kvp.Value != null)
                {
                    Destroy(kvp.Value);
                }
            }

            _placedBlocks.Clear();
        }

        /// <summary>
        /// Get the total count of placed blocks
        /// </summary>
        public int BlockCount => _placedBlocks.Count;
    }
}
