using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Grid-based world system for placing and managing blocks.
    /// Includes physics extension methods for block interactions.
    /// </summary>
    public class WorldGrid : MonoBehaviour
    {
        [Header("Grid Settings")]
        public float cellSize = 1f;

        private readonly Dictionary<Vector3Int, GameObject> _placedBlocks =
            new Dictionary<Vector3Int, GameObject>();

        /// <summary>
        /// Converts world position to grid coordinates.
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
        /// Converts grid coordinates to world position.
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
        /// Tries to get the block at the specified grid position.
        /// </summary>
        public bool TryGetBlock(Vector3Int gridPos, out GameObject block)
        {
            return _placedBlocks.TryGetValue(gridPos, out block);
        }

        /// <summary>
        /// Places a block at the specified grid position.
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
        /// Removes the block at the specified grid position.
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

        #region Physics Extension Methods

        /// <summary>
        /// Checks if a block exists at the specified position.
        /// </summary>
        public bool HasBlockAt(Vector3Int position)
        {
            return _placedBlocks.TryGetValue(position, out GameObject block) && block != null;
        }

        /// <summary>
        /// Gets the block GameObject at the specified position.
        /// </summary>
        public GameObject GetBlockAt(Vector3Int position)
        {
            if (_placedBlocks.TryGetValue(position, out GameObject block))
                return block;
            return null;
        }

        /// <summary>
        /// Checks if the block at the specified position has a PhysicsBlock component.
        /// </summary>
        public bool IsPhysicsBlock(Vector3Int position)
        {
            if (!_placedBlocks.TryGetValue(position, out GameObject block) || block == null)
                return false;

            return block.GetComponent<World.PhysicsBlock>() != null;
        }

        /// <summary>
        /// Triggers physics update on the block at the specified position.
        /// </summary>
        public void UpdatePhysicsAt(Vector3Int position)
        {
            if (!_placedBlocks.TryGetValue(position, out GameObject block) || block == null)
                return;

            var physicsBlock = block.GetComponent<World.PhysicsBlock>();
            if (physicsBlock != null)
            {
                // Physics blocks update themselves, just ensure they're active
                physicsBlock.enabled = true;
            }
        }

        /// <summary>
        /// Notifies all adjacent blocks (6 directions) that something changed.
        /// Useful for triggering physics updates on neighboring blocks.
        /// </summary>
        public void NotifyAdjacentBlocks(Vector3Int position)
        {
            Vector3Int[] adjacentOffsets = new Vector3Int[]
            {
                Vector3Int.up,
                Vector3Int.down,
                Vector3Int.left,
                Vector3Int.right,
                Vector3Int.forward,
                Vector3Int.back
            };

            foreach (var offset in adjacentOffsets)
            {
                Vector3Int adjacentPos = position + offset;
                UpdatePhysicsAt(adjacentPos);
            }
        }

        #endregion
    }
}
