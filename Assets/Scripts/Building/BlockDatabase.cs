using System.Collections.Generic;
using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// ScriptableObject that holds all registered <see cref="BlockType"/> assets.
    /// Create via <c>BlackRoad/Worldbuilder/BlockDatabase</c> in the Project menu.
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

        /// <summary>Returns the <see cref="BlockType"/> with the given id, or null.</summary>
        public BlockType Get(string id)
        {
            if (_byId == null || _byId.Count == 0)
                BuildIndex();

            return _byId != null && _byId.TryGetValue(id, out var block) ? block : null;
        }

        /// <summary>Returns the first block in the database, or null if the database is empty.</summary>
        public BlockType GetDefault()
        {
            if (blocks != null && blocks.Length > 0)
                return blocks[0];

            return null;
        }

        /// <summary>
        /// Returns all blocks that belong to the specified <paramref name="category"/>.
        /// </summary>
        public BlockType[] GetByCategory(BlockCategory category)
        {
            if (blocks == null)
                return System.Array.Empty<BlockType>();

            var result = new List<BlockType>();
            foreach (var block in blocks)
            {
                if (block != null && block.category == category)
                    result.Add(block);
            }

            return result.ToArray();
        }
    }
}
