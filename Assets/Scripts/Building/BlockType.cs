using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Broad grouping used by <see cref="BlockDatabase"/> and the
    /// <see cref="BlackRoad.Worldbuilder.UI.BlockSelectionBar"/> hotbar.
    /// </summary>
    public enum BlockCategory
    {
        Terrain,
        Structure,
        Decorative,
    }

    /// <summary>
    /// ScriptableObject that describes a single placeable block type.
    /// Create via <c>BlackRoad/Worldbuilder/BlockType</c> in the Project menu.
    /// </summary>
    [CreateAssetMenu(
        fileName = "BlockType",
        menuName = "BlackRoad/Worldbuilder/BlockType",
        order = 0
    )]
    public class BlockType : ScriptableObject
    {
        [Header("Identity")]
        public string blockId = "block.dirt";
        public string displayName = "Dirt";

        [Header("Visuals")]
        public GameObject prefab;
        public Color gizmoColor = Color.gray;

        [Header("Classification")]
        public BlockCategory category = BlockCategory.Terrain;

        [Header("Gameplay")]
        [Tooltip("Relative hardness (1 = default). Higher values take longer to break.")]
        [Min(0.1f)]
        public float hardness = 1f;

        [Tooltip("Time in seconds for a player to break this block.")]
        [Min(0f)]
        public float breakTime = 0.5f;
    }
}
