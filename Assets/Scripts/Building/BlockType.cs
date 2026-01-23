using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Categories for block types to organize the block database
    /// </summary>
    public enum BlockCategory
    {
        Terrain,
        Structure,
        Decorative
    }

    /// <summary>
    /// ScriptableObject defining a block type with its properties.
    /// Includes category, hardness (break time), prefab, and icon for UI.
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
        
        [Header("Category")]
        [Tooltip("Category for organizing blocks in UI")]
        public BlockCategory category = BlockCategory.Terrain;
        
        [Header("Prefab")]
        [Tooltip("The 3D prefab to instantiate when placing this block")]
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
    }
}
