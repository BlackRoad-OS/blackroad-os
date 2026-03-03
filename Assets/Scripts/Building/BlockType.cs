using UnityEngine;

namespace BlackRoad.Worldbuilder.Building
{
    /// <summary>
    /// Block category types for organization and filtering.
    /// </summary>
    public enum BlockCategory
    {
        Terrain,
        Structure,
        Decorative,
        Other
    }

    /// <summary>
    /// Defines a single block type with its properties, prefab, and metadata.
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
        
        [Header("Visual")]
        public GameObject prefab;
        public Color gizmoColor = Color.gray;
        
        [Header("Properties")]
        public BlockCategory category = BlockCategory.Terrain;
        public float hardness = 1f;
        
        [Header("UI")]
        public Sprite icon;
    }
}
