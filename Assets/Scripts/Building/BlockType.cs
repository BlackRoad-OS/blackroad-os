using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>Broad category used to group blocks in the selection bar and database.</summary>
    public enum BlockCategory
    {
        Terrain,
        Structure,
        Decorative
    }

    [CreateAssetMenu(
        fileName = "BlockType",
        menuName = "BlackRoad/Worldbuilder/BlockType",
        order = 0
    )]
    public class BlockType : ScriptableObject
    {
        public string blockId = "block.dirt";
        public string displayName = "Dirt";
        public GameObject prefab;
        public Color gizmoColor = Color.gray;

        [Header("Classification")]
        public BlockCategory category = BlockCategory.Terrain;

        [Header("Gameplay")]
        [Tooltip("Time in seconds required to break this block. 0 = instant.")]
        [Min(0f)]
        public float breakTime = 0f;
    }
}
