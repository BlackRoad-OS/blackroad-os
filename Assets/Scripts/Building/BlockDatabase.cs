using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// ScriptableObject registry of all block types.
    /// Provides lookup by ID and category filtering.
    /// </summary>
    [CreateAssetMenu(
        fileName = "BlockDatabase",
        menuName = "BlackRoad/Worldbuilder/BlockDatabase",
        order = 1
    )]
    public class BlockDatabase : ScriptableObject
    {
        public BlockType[] blocks;

        private Dictionary<string, BlockType> _byId;

        private void OnEnable()
        {
            BuildIndex();
        }

        private void BuildIndex()
        {
            _byId = new Dictionary<string, BlockType>();

            if (blocks == null) return;

            foreach (var block in blocks)
            {
                if (block == null || string.IsNullOrEmpty(block.blockId)) continue;

                if (!_byId.ContainsKey(block.blockId))
                {
                    _byId.Add(block.blockId, block);
                }
            }
        }

        /// <summary>
        /// Get a block type by its ID
        /// </summary>
        public BlockType Get(string id)
        {
            if (_byId == null || _byId.Count == 0)
                BuildIndex();

            return _byId != null && _byId.TryGetValue(id, out var block) ? block : null;
        }

        /// <summary>
        /// Get the first block in the database (default selection)
        /// </summary>
        public BlockType GetDefault()
        {
            if (blocks != null && blocks.Length > 0)
                return blocks[0];

            return null;
        }

        /// <summary>
        /// Get all blocks in a specific category
        /// </summary>
        public BlockType[] GetByCategory(BlockCategory category)
        {
            if (blocks == null)
                return new BlockType[0];

            return blocks.Where(b => b != null && b.category == category).ToArray();
        }

        /// <summary>
        /// Get all blocks as a list (useful for UI)
        /// </summary>
        public BlockType[] GetAll()
        {
            if (blocks == null)
                return new BlockType[0];

            return blocks.Where(b => b != null).ToArray();
        }

        /// <summary>
        /// Get block at specific index (for hotbar number keys)
        /// </summary>
        public BlockType GetAtIndex(int index)
        {
            if (blocks == null || index < 0 || index >= blocks.Length)
                return null;

            return blocks[index];
        }

        /// <summary>
        /// Get total count of blocks in database
        /// </summary>
        public int Count => blocks?.Length ?? 0;
    }
}
