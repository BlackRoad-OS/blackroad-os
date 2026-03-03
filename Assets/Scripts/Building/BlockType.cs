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
        [Header("Identity")]
        public string blockId = "block.dirt";
        public string displayName = "Dirt";

        [Header("Visuals")]
        public GameObject prefab;
        
        [Header("Properties")]
        [Tooltip("Time in seconds to break this block (0 = instant)")]
        [Range(0f, 10f)]
        public float hardness = 1f;
        
        [Header("UI")]
        [Tooltip("Icon sprite for hotbar/inventory UI")]
        public Sprite icon;
        
        [Header("Debug")]
        [Tooltip("Color for grid gizmos")]
        public Color gizmoColor = Color.gray;

        [Header("Classification")]
        public BlockCategory category = BlockCategory.Terrain;
    }
}
